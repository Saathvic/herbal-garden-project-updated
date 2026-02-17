import { useState, useRef, useEffect } from 'react'

const CHAT_API = 'http://localhost:3000/chat'

const EXAMPLES = [
  'Stress & Anxiety',
  'Digestive Issues',
  'Joint Pain',
  'Memory & Focus',
  'Skin Problems',
  'Cough & Cold',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm your Ayurvedic wellness assistant 🌿\nAsk me about any health concern for herbal remedies.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const query = (text || input).trim()
    if (!query || loading) return

    setMessages((m) => [...m, { role: 'user', text: query }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setMessages((m) => [...m, { role: 'bot', data }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Sorry, could not reach the server. Make sure the backend is running on port 3000.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      send()
    }
  }

  // Prevent pointer-lock from capturing clicks inside the widget
  function stopPropagation(e) {
    e.stopPropagation()
  }

  return (
    <>
      {/* ── Floating Action Button ─────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        onPointerDown={stopPropagation}
        style={styles.fab}
        title="Health Chatbot"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* ── Chat Popup ─────────────────────────────────────── */}
      {open && (
        <div
          style={styles.popup}
          onPointerDown={stopPropagation}
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
        >
          {/* Header */}
          <div style={styles.header}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>🌿 Ayurvedic Health Chat</span>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* Quick chips */}
          <div style={styles.chips}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                style={styles.chip}
                onClick={() => send(ex)}
                disabled={loading}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {loading && (
              <div style={{ ...styles.bubble, ...styles.botBubble, opacity: 0.7 }}>
                <span style={styles.dots}>
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Describe your health concern..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              autoFocus
            />
            <button
              style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Inline keyframes for the loading dots */}
      <style>{`
        .chat-dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #228B22;
          margin: 0 2px;
          animation: chatBounce 1.2s infinite ease-in-out;
        }
        .chat-dot:nth-child(2) { animation-delay: 0.15s; }
        .chat-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes chatBounce {
          0%,80%,100% { transform: scale(0.4); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}

/* ── Single message renderer ─────────────────────────── */
function Message({ msg }) {
  if (msg.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <div style={{ ...styles.bubble, ...styles.userBubble }}>{msg.text}</div>
      </div>
    )
  }

  // Plain text bot message (welcome / error)
  if (msg.text) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
        <div style={{ ...styles.bubble, ...styles.botBubble, whiteSpace: 'pre-line' }}>{msg.text}</div>
      </div>
    )
  }

  // Structured bot response
  const d = msg.data
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
      <div style={styles.responseCard}>
        <p style={{ margin: '0 0 10px', lineHeight: 1.5 }}>{d.summary}</p>

        <div style={styles.sectionTitle}>🌿 Recommended Herbs</div>
        {d.recommended_herbs?.map((h, i) => (
          <div key={i} style={styles.herbCard}>
            <span style={{ fontWeight: 700, color: '#228B22' }}>{h.name}</span>
            {h.scientific_name && (
              <span style={{ fontStyle: 'italic', color: '#888', fontSize: 12, marginLeft: 6 }}>
                ({h.scientific_name})
              </span>
            )}
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>{h.reason}</p>
          </div>
        ))}

        <div style={styles.sectionTitle}>📋 Preparation</div>
        <div style={styles.prepBox}>{d.preparation}</div>

        {d.disclaimer && <p style={styles.disclaimer}>{d.disclaimer}</p>}
      </div>
    </div>
  )
}

/* ── Styles ───────────────────────────────────────────── */
const styles = {
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 10000,
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #228B22, #2d8a44)',
    color: '#fff',
    fontSize: 26,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },

  popup: {
    position: 'fixed',
    bottom: 90,
    right: 24,
    zIndex: 10000,
    width: 380,
    maxWidth: 'calc(100vw - 48px)',
    height: 520,
    maxHeight: 'calc(100vh - 120px)',
    borderRadius: 16,
    background: '#fff',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  header: {
    background: 'linear-gradient(135deg, #228B22, #2d8a44)',
    color: '#fff',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },

  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
  },

  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '8px 12px',
    background: '#f0f7f0',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0,
  },

  chip: {
    padding: '4px 10px',
    borderRadius: 12,
    border: '1px solid #228B22',
    background: '#fff',
    color: '#228B22',
    fontSize: 11,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    background: '#f9f9f9',
  },

  bubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: 16,
    fontSize: 13,
    lineHeight: 1.45,
    wordBreak: 'break-word',
  },

  userBubble: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    borderBottomRightRadius: 4,
  },

  botBubble: {
    background: '#fff',
    color: '#333',
    border: '1.5px solid #228B22',
    borderBottomLeftRadius: 4,
  },

  responseCard: {
    maxWidth: '90%',
    background: '#fff',
    border: '1.5px solid #228B22',
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    color: '#333',
  },

  sectionTitle: {
    fontWeight: 700,
    fontSize: 13,
    color: '#228B22',
    margin: '10px 0 6px',
  },

  herbCard: {
    background: '#f5faf5',
    borderLeft: '3px solid #228B22',
    padding: '6px 10px',
    borderRadius: 6,
    marginBottom: 6,
  },

  prepBox: {
    background: '#fff8dc',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 12.5,
    lineHeight: 1.55,
    color: '#555',
  },

  disclaimer: {
    marginTop: 10,
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: 8,
  },

  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    borderTop: '1px solid #e0e0e0',
    background: '#fff',
    flexShrink: 0,
  },

  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1.5px solid #ccc',
    borderRadius: 20,
    fontSize: 13,
    outline: 'none',
  },

  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #228B22, #2d8a44)',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  dots: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 0',
  },
}
