'use client';

import { useState, useEffect, useRef } from 'react';

/* ── Agora / API ─────────────────────────────── */
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const CHANNEL = 'interview-room';
const UID = 111222;

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ── Mock dashboard data ─────────────────────── */
const STATS = [
  { label: 'Interviews',  value: '124', delta: '+12 this month' },
  { label: 'Candidates',  value: '89',  delta: '+5 this week'   },
  { label: 'Completed',   value: '108', delta: '87% completion' },
  { label: 'Avg Score',   value: '78',  delta: '+2.1 pts'       },
];

const MOCK_ROWS = [
  { id:1, initials:'SC', candidate:'Sarah Chen',     role:'Sr. Frontend Engineer', type:'Technical',  status:'completed',    score:87,   date:'Oct 1'  },
  { id:2, initials:'JP', candidate:'James Park',     role:'Product Manager',       type:'Behavioral', status:'in-progress',  score:null, date:'Oct 2'  },
  { id:3, initials:'PP', candidate:'Priya Patel',    role:'Data Scientist',        type:'Technical',  status:'scheduled',    score:null, date:'Oct 3'  },
  { id:4, initials:'MJ', candidate:'Marcus Johnson', role:'Backend Engineer',      type:'Technical',  status:'needs-review', score:74,   date:'Sep 30' },
  { id:5, initials:'EW', candidate:'Emma Wilson',    role:'UX Designer',           type:'Portfolio',  status:'completed',    score:91,   date:'Sep 29' },
];

const NAV = [
  { id:'dashboard',   label:'Dashboard'  },
  { id:'interview',   label:'Interviews' },
  { id:'candidates',  label:'Candidates' },
  { id:'questions',   label:'Questions'  },
  { id:'reports',     label:'Reports'    },
];

/* ── SVG Icons ───────────────────────────────── */
const IC = {
  dashboard: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
      <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
    </svg>
  ),
  interview: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5a2.5 2.5 0 0 1 0 5"/><path d="M8 1.5a2.5 2.5 0 0 0 0 5"/>
      <path d="M13 11.5A5 5 0 0 0 3 11.5"/><line x1="8" y1="9.5" x2="8" y2="11"/>
      <line x1="6" y1="14.5" x2="10" y2="14.5"/>
    </svg>
  ),
  candidates: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5"/><path d="M11 14a5 5 0 0 0-10 0"/>
      <circle cx="12" cy="5" r="2"/><path d="M14.5 13a3.5 3.5 0 0 0-3.5-3.5"/>
    </svg>
  ),
  questions: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2V3Z"/>
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13V8m3 5V5m3 8V7m3 6V3"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3"/>
      <line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/>
      <line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/>
      <line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/><line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/>
      <line x1="3.05" y1="12.95" x2="4.1" y2="11.9"/><line x1="11.9" y1="4.1" x2="12.95" y2="3.05"/>
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 9A6 6 0 0 1 7 2.5a5.5 5.5 0 1 0 6.5 6.5Z"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
    </svg>
  ),
  mic: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="1" width="6" height="8" rx="3"/>
      <path d="M3 7a5 5 0 0 0 10 0"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="5" y1="15" x2="11" y2="15"/>
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="10" height="10" rx="1.5"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8l4 4 7-8"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10m-4-4 4 4-4 4"/>
    </svg>
  ),
};

/* ── Waveform ────────────────────────────────── */
function Waveform({ active = false }) {
  return (
    <div className="waveform" aria-hidden="true">
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} className={`wv-bar ${active ? 'on' : ''}`} />
      ))}
    </div>
  );
}

/* ── Status Badge ────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    'completed':    { cls:'badge-done',   dot:false, label:'Completed'    },
    'in-progress':  { cls:'badge-live',   dot:true,  label:'In Progress'  },
    'scheduled':    { cls:'badge-sched',  dot:false, label:'Scheduled'    },
    'needs-review': { cls:'badge-review', dot:true,  label:'Needs Review' },
  };
  const { cls, dot, label } = map[status] || { cls:'badge-neutral', dot:false, label:status };
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className="badge-dot" />}
      {label}
    </span>
  );
}

/* ── Score Badge ─────────────────────────────── */
function ScoreBadge({ score }) {
  if (!score) return <span className="score-badge score-nil">—</span>;
  const cls = score >= 85 ? 'score-hi' : score >= 70 ? 'score-mid' : 'score-lo';
  return <span className={`score-badge ${cls}`}>{score}</span>;
}

/* ── Format timer ────────────────────────────── */
function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2,'0');
  const sec = (s % 60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

/* ── Sidebar ─────────────────────────────────── */
function Sidebar({ view, setView, dark, setDark, open, setOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L8.5 7H1.5L5 1Z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="logo-text">VocalHire</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? 'active' : ''}`}
              onClick={() => { setView(n.id); setOpen(false); }}
            >
              <span className="nav-icon" style={{ width:16, height:16 }}>
                {IC[n.id] || IC.dashboard}
              </span>
              {n.label}
            </button>
          ))}

          <div className="divider" style={{ margin:'0.75rem 0.375rem' }} />
          <div className="nav-section-label">Other</div>

          <button className="nav-item" onClick={() => setOpen(false)}>
            <span className="nav-icon" style={{ width:16, height:16 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="3"/><path d="M8 1v1m0 12v1M1 8h1m12 0h1M3.05 3.05l.7.7m8.2 8.2.7.7M3.05 12.95l.7-.7m8.2-8.2.7-.7"/>
              </svg>
            </span>
            Settings
          </button>
        </nav>

        {/* User + theme */}
        <div className="sidebar-bottom">
          <div className="user-row">
            <div className="user-avatar">HC</div>
            <span className="user-name">Harsh</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => setDark(d => !d)}
            aria-label="Toggle theme"
            title={dark ? 'Switch to light' : 'Switch to dark'}
          >
            <span style={{ width:14, height:14, display:'flex' }}>
              {dark ? IC.sun : IC.moon}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Dashboard ───────────────────────────────── */
function Dashboard({ setView }) {
  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, Harsh</h1>
          <p className="page-sub">Here's what's happening with your interviews.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView('interview')}>
          <span style={{ width:14, height:14, display:'flex' }}>{IC.plus}</span>
          New Interview
        </button>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-row">
          {STATS.map(s => (
            <div key={s.label} className="stat-cell">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-delta">{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Recent interviews table */}
        <div className="section-title">
          <span>Recent Interviews</span>
          <button className="tbl-link" onClick={() => setView('interview')}>
            View all →
          </button>
        </div>
        <div className="table-wrap">
          <table className="vh-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Type</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map(row => (
                <tr key={row.id}>
                  <td>
                    <div className="td-candidate">
                      <div className="cand-avatar">{row.initials}</div>
                      <span>{row.candidate}</span>
                    </div>
                  </td>
                  <td className="td-muted">{row.role}</td>
                  <td className="td-muted">{row.type}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><ScoreBadge score={row.score} /></td>
                  <td className="td-muted">{row.date}</td>
                  <td>
                    <button
                      className="tbl-link"
                      onClick={() => setView('interview')}
                    >
                      {row.status === 'scheduled' ? 'Start' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Interview View ──────────────────────────── */
function InterviewView({ phase, lines, timer, onStart, onFinish, transcriptRef }) {
  const isIdle       = phase === 'idle';
  const isConnecting = phase === 'connecting';
  const isLive       = phase === 'live';

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Interview Room</h1>
          <p className="page-sub">Voice-powered interview with real-time transcription.</p>
        </div>
        <StatusBadge
          status={
            isIdle ? 'scheduled' :
            isConnecting ? 'in-progress' :
            isLive ? 'in-progress' : 'completed'
          }
        />
      </div>

      {/* Idle — ready to start */}
      {isIdle && (
        <div className="state-center fade-up">
          <div className="state-icon-wrap">
            <span style={{ width:20, height:20, display:'flex' }}>{IC.mic}</span>
          </div>
          <div className="state-title">Ready to begin</div>
          <p className="state-desc">
            Your AI interviewer is standing by. Make sure your microphone is connected and click Start when you're ready.
          </p>
          <button className="btn btn-primary" style={{ marginTop:'0.5rem' }} onClick={onStart}>
            <span style={{ width:14, height:14, display:'flex' }}>{IC.mic}</span>
            Start Interview
          </button>
        </div>
      )}

      {/* Connecting */}
      {isConnecting && (
        <div className="state-center fade-up">
          <div className="state-icon-wrap">
            <div className="spinner" />
          </div>
          <div className="state-title">Setting up your session</div>
          <p className="state-desc">Connecting your microphone and inviting the AI interviewer…</p>
        </div>
      )}

      {/* Live */}
      {isLive && (
        <div className="interview-layout fade-up">

          {/* Top bar */}
          <div className="interview-topbar">
            <div className="interview-who">
              <span className="interview-name">AI Interview Session</span>
              <span className="interview-role">General · Technical Screening</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
              <span className="timer">{fmtTime(timer)}</span>
              <button className="btn btn-danger" onClick={onFinish}>
                <span style={{ width:13, height:13, display:'flex' }}>{IC.stop}</span>
                End Interview
              </button>
            </div>
          </div>

          {/* Current question */}
          <div className="question-card">
            <div className="question-eyebrow">Current Question</div>
            <p className="question-text">
              Tell us about a challenging technical problem you've solved recently and how you approached it.
            </p>
          </div>

          {/* Mic + waveform */}
          <div className="mic-area">
            <button className="mic-btn listening" aria-label="Listening">
              <span style={{ width:22, height:22, display:'flex' }}>{IC.mic}</span>
            </button>
            <Waveform active />
            <span className="mic-label">Listening — speak naturally</span>
          </div>

          {/* Transcript */}
          <div className="transcript-box">
            <div className="transcript-head">
              <span className="transcript-label">Live Transcript</span>
              <Waveform active />
            </div>
            <div className="transcript-scroll" ref={transcriptRef}>
              {lines.length === 0
                ? <div className="t-empty">Conversation will appear here…</div>
                : lines.map((l, i) => (
                  <div key={i} className="t-line">
                    <div className="t-speaker">{l.role === 'agent' ? 'Interviewer' : 'You'}</div>
                    <div className={`t-text ${!l.final ? 'partial' : ''}`}>{l.text}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Review View ─────────────────────────────── */
function ReviewView({ score, lines, onRestart }) {
  const pct = score?.score ?? 0;

  // Derive mock eval scores from overall score
  const evals = [
    { name: 'Communication',      val: Math.min(100, Math.round(pct * 0.98 + Math.random()*5)) },
    { name: 'Technical Knowledge',val: Math.min(100, Math.round(pct * 1.02 - Math.random()*4)) },
    { name: 'Problem Solving',    val: Math.min(100, Math.round(pct * 1.0  + Math.random()*6)) },
    { name: 'Confidence',         val: Math.min(100, Math.round(pct * 0.95 + Math.random()*8)) },
    { name: 'Role Fit',           val: Math.min(100, Math.round(pct * 0.9  + Math.random()*10)) },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Interview Review</h1>
          <p className="page-sub">Session completed · {new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-ghost" onClick={onRestart}>
            <span style={{ width:14, height:14, display:'flex' }}>{IC.mic}</span>
            New Interview
          </button>
        </div>
      </div>

      <div className="review-layout">
        {/* Score */}
        <div className="review-score-card">
          <div className="score-ring">
            <span className="score-num">{pct}</span>
          </div>
          <div>
            <div className="review-score-title">
              {pct >= 85 ? 'Excellent performance' : pct >= 70 ? 'Good performance' : 'Needs improvement'}
            </div>
            <div className="review-score-sub">Overall score out of 100</div>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <ScoreBadge score={pct} />
          </div>
        </div>

        {/* Evaluation breakdown */}
        <div className="review-section">
          <div className="review-section-head">Evaluation Breakdown</div>
          <div className="review-section-body" style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {evals.map(e => (
              <div key={e.name} className="eval-row">
                <span className="eval-name">{e.name}</span>
                <div className="eval-track">
                  <div className="eval-fill" style={{ width:`${e.val}%` }} />
                </div>
                <span className="eval-val">{e.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {score?.feedback && (
          <div className="review-section">
            <div className="review-section-head">Reviewer Feedback</div>
            <div className="review-section-body">
              <p className="feedback-text">{score.feedback}</p>
            </div>
          </div>
        )}

        {/* Transcript */}
        {lines.length > 0 && (
          <div className="review-section">
            <div className="review-section-head">Full Transcript</div>
            <div className="transcript-scroll" style={{ maxHeight:'320px', padding:'0.875rem 1rem' }}>
              {lines.map((l, i) => (
                <div key={i} className="t-line" style={{ marginBottom:'0.75rem' }}>
                  <div className="t-speaker">{l.role === 'agent' ? 'Interviewer' : 'You'}</div>
                  <div className="t-text">{l.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Root ────────────────────────────────────── */
export default function Home() {
  const [view,        setView]        = useState('dashboard');
  const [dark,        setDark]        = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Interview state
  const [phase,  setPhase]  = useState('idle');   // idle | connecting | live | done
  const [lines,  setLines]  = useState([]);
  const [score,  setScore]  = useState(null);
  const [timer,  setTimer]  = useState(0);

  const transcriptRef = useRef(null);
  const timerRef      = useRef(null);

  // Live session handles — stable across renders
  const rtcRef      = useRef(null);
  const micRef      = useRef(null);
  const rtmRef      = useRef(null);
  const convoAIRef  = useRef(null);
  const agentIdRef  = useRef(null);
  const linesRef    = useRef([]);

  /* Apply dark class */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  /* Auto-scroll transcript */
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [lines]);

  /* Timer */
  useEffect(() => {
    if (phase === 'live') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (phase === 'idle') setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  async function start() {
    setPhase('connecting');
    setLines([]);
    linesRef.current = [];

    const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
    const { default: AgoraRTM } = await import('agora-rtm-sdk');
    const { ConversationalAIAPI, EConversationalAIAPIEvents, ETranscriptHelperMode, EMessageType } =
      await import('agora-agent-client-toolkit');

    const res = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: CHANNEL, uid: UID }),
    });
    const { rtcToken, rtmToken } = await res.json();

    const rtc = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    rtcRef.current = rtc;
    await rtc.join(APP_ID, CHANNEL, rtcToken, UID);

    const mic = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true, AGC: true });
    micRef.current = mic;
    await rtc.publish(mic);

    rtc.on('user-published', async (user, type) => {
      if (type === 'audio') {
        await rtc.subscribe(user, type);
        user.audioTrack.play();
      }
    });

    const rtm = new AgoraRTM.RTM(APP_ID, String(UID));
    rtmRef.current = rtm;
    await rtm.login({ token: rtmToken });
    await rtm.subscribe(CHANNEL);

    const convoAI = await ConversationalAIAPI.init({
      rtcEngine: rtc, rtmEngine: rtm,
      renderMode: ETranscriptHelperMode.TEXT,
    });
    convoAIRef.current = convoAI;

    convoAI.on(EConversationalAIAPIEvents.TRANSCRIPT_UPDATED, (items) => {
      const mapped = items.map(item => ({
        role: item.metadata?.object === EMessageType.USER_TRANSCRIPTION ? 'user' : 'agent',
        text: item.text,
        final: item.status !== 0,
      }));
      linesRef.current = mapped;
      setLines(mapped);
    });
    convoAI.subscribeMessage(CHANNEL);

    const invite = await fetch('/api/invite-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: CHANNEL }),
    });
    const inviteData = await invite.json();
    if (!invite.ok) {
      throw new Error(`Failed to invite agent: ${inviteData.error || JSON.stringify(inviteData)}`);
    }
    agentIdRef.current = inviteData.agentId;
    setPhase('live');
  }

  async function finish() {
    // Grab refs immediately so nothing can go stale
    const agentId = agentIdRef.current;
    const convoAI  = convoAIRef.current;
    const mic      = micRef.current;
    const rtc      = rtcRef.current;
    const rtm      = rtmRef.current;
    const snapshot = linesRef.current;

    // Clear refs so a double-click can't re-trigger
    agentIdRef.current = null;
    convoAIRef.current = null;
    micRef.current     = null;
    rtcRef.current     = null;
    rtmRef.current     = null;

    try {
      if (agentId) {
        await post('/api/stop-agent', { agentId });
      }
    } catch (err) {
      console.warn('stop-agent failed (continuing cleanup):', err);
    }

    try { convoAI?.unsubscribe(); } catch (_) {}
    try { convoAI?.destroy();     } catch (_) {}
    try { mic?.close();           } catch (_) {}
    try { await rtc?.leave();     } catch (_) {}
    try { await rtm?.logout();    } catch (_) {}

    let result = null;
    try {
      result = await post('/api/score-agent', { transcript: snapshot });
    } catch (err) {
      console.warn('score-agent failed:', err);
    }

    setScore(result);
    setPhase('done');
    setView('review');
  }

  function restart() {
    setPhase('idle');
    setLines([]);
    setScore(null);
    setView('interview');
  }

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <Sidebar
        view={view}
        setView={setView}
        dark={dark}
        setDark={setDark}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main */}
      <div className="main-area">

        {/* Mobile header */}
        <div className="mobile-header">
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div className="logo-mark" style={{ width:'1.25rem', height:'1.25rem' }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L8.5 7H1.5L5 1Z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="logo-text">VocalHire</span>
          </div>
          <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <span style={{ width:16, height:16, display:'flex' }}>
              {sidebarOpen ? IC.x : IC.menu}
            </span>
          </button>
        </div>

        {/* Views */}
        {view === 'dashboard'  && <Dashboard setView={setView} />}

        {view === 'interview'  && (
          <InterviewView
            phase={phase}
            lines={lines}
            timer={timer}
            onStart={start}
            onFinish={finish}
            transcriptRef={transcriptRef}
          />
        )}

        {view === 'review' && (
          <ReviewView score={score} lines={lines} onRestart={restart} />
        )}

        {/* Placeholder views */}
        {(view === 'candidates' || view === 'questions' || view === 'reports') && (
          <div className="state-center fade-up">
            <div className="state-icon-wrap">
              <span style={{ width:20, height:20, display:'flex' }}>
                {IC[view] || IC.dashboard}
              </span>
            </div>
            <div className="state-title">
              {NAV.find(n => n.id === view)?.label}
            </div>
            <p className="state-desc">This section is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}