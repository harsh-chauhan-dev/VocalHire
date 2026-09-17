import { NextResponse } from 'next/server';
import {
    AgoraClient,
    Agent,
    Area,
    DeepgramSTT,
    MiniMaxTTS,
    OpenAI,
} from 'agora-agents';

const client = new AgoraClient({
    area: Area.US,
    appId: process.env.AGORA_APP_ID,
    appCertificate: process.env.AGORA_APP_CERTIFICATE,
});

const PROMPT = `
You are interviewing someone for a junior developer job.
Ask ONE question at a time, then stop and wait for their answer.
Ask about JavaScript basics. Keep everything you say under 20 seconds.
After they answer, ask a follow-up about what they actually said.
`;

export async function POST(req) {
    try {
        const { channel } = await req.json();

        if (!channel) {
            return NextResponse.json(
                { error: 'channel is required' },
                { status: 400 }
            );
        }

        const agent = new Agent({
            client,
            instructions: PROMPT,
            greeting: 'Hi, thanks for making the time. Shall we start?',
            advancedFeatures: {
                enable_rtm: true,
            },
            parameters: {
                data_channel: 'rtm',
            },
        })
            .withStt(
                new DeepgramSTT({
                    model: 'nova-3',
                    language: 'en',
                })
            )
            .withLlm(
                new OpenAI({
                    model: 'gpt-4o-mini',
                })
            )
            .withTts(
                new MiniMaxTTS({
                    model: 'speech_2_6_turbo',
                    voiceId: 'English_captivating_female1',
                })
            )
            .withTurnDetection({
                mode: 'default',
                config: {
                    start_of_speech: {
                        mode: 'vad',
                        vad_config: {
                            interrupt_duration_ms: 160,
                        },
                    },
                    end_of_speech: {
                        mode: 'semantic',
                        semantic_config: {
                            silence_duration_ms: 320,
                        },
                    },
                },
            });

        const session = agent.createSession({
            name: `interview-${Date.now()}`,
            channel,
            agentUid: '999888',
            remoteUids: ['*'],
            idleTimeout: 30,
        });


        const { agentId } = await session.start();

        return NextResponse.json({
            success: true,
            agentId,
        });
    } catch (error) {
        console.error('Invite agent error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : String(error),
            },
            { status: 500 }
        );
    }
}