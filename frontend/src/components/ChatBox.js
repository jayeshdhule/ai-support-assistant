import React, { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

const BOT_AVATAR = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="18" height="13" rx="3" fill="currentColor" opacity="0.15"/>
    <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
    <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

const StatusDot = ({ online }) => (
  <span style={{
    width: 8, height: 8, borderRadius: "50%",
    background: online ? "#22c55e" : "#94a3b8",
    display: "inline-block",
    boxShadow: online ? "0 0 0 2px rgba(34,197,94,0.25)" : "none",
  }} />
);

function TypingIndicator() {
  return (
    <div style={styles.typingWrapper}>
      <div style={styles.typingBubble}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            ...styles.typingDot,
            animationDelay: `${i * 0.18}s`
          }} />
        ))}
      </div>
    </div>
  );
}

function Message({ msg, isLast }) {
  const isUser = msg.sender === "user";
  return (
    <div style={{
      ...styles.messageRow,
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end",
    }}>
      {!isUser && (
        <div style={styles.botAvatar}>
          {BOT_AVATAR}
        </div>
      )}
      <div style={{
        ...styles.bubble,
        ...(isUser ? styles.userBubble : styles.botBubble),
      }}>
        {msg.text}
        <span style={styles.timestamp}>{msg.time}</span>
      </div>
    </div>
  );
}

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! 👋 I'm your AI assistant. How can I help you today?",
      time: formatTime(new Date())
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop =
      chatContainerRef.current.scrollHeight;
  }
}, [messages, loading]);

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();

    setMessages(prev => [...prev, { sender: "user", text, time: formatTime(new Date()) }]);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      const response = await sendMessage(text);
      let reply = response.reply;
      if (reply.includes("403") || reply.includes("API key")) {
        reply = "⚠️ AI service temporarily unavailable. Please try again later.";
      }
      setMessages(prev => [...prev, { sender: "bot", text: reply, time: formatTime(new Date()) }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "⚠️ Something went wrong. Please check your connection and retry.",
        time: formatTime(new Date())
      }]);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }

        .chat-input::placeholder { color: #52525b; }
        .chat-input:focus { outline: none; }
        .chat-input { background: transparent; border: none; color: #e4e4e7; }

        .send-btn {
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border: none;
          border-radius: 12px;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #fff;
          transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(99,102,241,0.35);
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.06);
          box-shadow: 0 4px 20px rgba(99,102,241,0.5);
        }
        .send-btn:active:not(:disabled) { transform: scale(0.96); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }

        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-animate {
          animation: fadeSlideIn 0.25s ease forwards;
        }
      `}</style>

      <div style={styles.page}>
        {/* Background ambient glow */}
        <div style={styles.ambientTop} />
        <div style={styles.ambientBottom} />

        <div style={styles.wrapper}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.headerAvatar}>
                <span style={{ color: "#818cf8" }}>{BOT_AVATAR}</span>
              </div>
              <div>
                <div style={styles.headerName}>AI Assistant</div>
                <div style={styles.headerStatus}>
                  <StatusDot online={true} />
                  <span style={{ marginLeft: 5, color: "#71717a", fontSize: 12 }}>Always online</span>
                </div>
              </div>
            </div>
            <button style={styles.menuBtn}>
              <DotsIcon />
            </button>
          </div>

          {/* Messages */}
          <div
  ref={chatContainerRef}
  className="chat-scrollbar"
  style={styles.chatArea}
>
            {/* Date chip */}
            <div style={styles.dateChip}>Today</div>

            {messages.map((msg, i) => (
              <div key={i} className="message-animate">
                <Message msg={msg} isLast={i === messages.length - 1} />
              </div>
            ))}

            {loading && <TypingIndicator />}
          </div>

          {/* Input Bar */}
          <div style={styles.inputSection}>
            <div style={styles.inputBar}>
              <input
                ref={inputRef}
                className="chat-input"
                style={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                <SendIcon />
              </button>
            </div>
            <p style={styles.footer}>Powered by AI · End-to-end secured</p>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0f",
    position: "fixed",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  ambientTop: {
    position: "absolute",
    top: -200,
    left: "30%",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ambientBottom: {
    position: "absolute",
    bottom: -200,
    right: "20%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  wrapper: {
    width: "100%",
    maxWidth: 680,
    height: "min(92vh, 760px)",
    display: "flex",
    flexDirection: "column",
    background: "#111116",
    border: "1px solid #1f1f2e",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1c1c26",
    background: "#111116",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: "#e4e4e7",
    letterSpacing: "-0.01em",
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    marginTop: 2,
  },
  menuBtn: {
    background: "transparent",
    border: "1px solid #27272a",
    borderRadius: 10,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#71717a",
    transition: "background 0.15s, color 0.15s",
  },
  chatArea: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  dateChip: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 500,
    color: "#3f3f46",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
  messageRow: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#818cf8",
    flexShrink: 0,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "68%",
    padding: "11px 15px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.6,
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    letterSpacing: "-0.005em",
  },
  botBubble: {
    background: "#18181f",
    color: "#d4d4d8",
    border: "1px solid #27272a",
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    borderBottomRightRadius: 5,
    boxShadow: "0 2px 12px rgba(99,102,241,0.25)",
  },
  timestamp: {
    display: "block",
    fontSize: 10,
    opacity: 0.45,
    marginTop: 5,
    textAlign: "right",
    fontWeight: 400,
    letterSpacing: "0.02em",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 10,
  },
  typingBubble: {
    background: "#18181f",
    border: "1px solid #27272a",
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    padding: "12px 16px",
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  typingDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#52525b",
    animation: "bounce-dot 1.1s ease infinite",
  },
  inputSection: {
    padding: "12px 16px 14px",
    borderTop: "1px solid #1c1c26",
    background: "#111116",
    flexShrink: 0,
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#18181f",
    border: "1px solid #27272a",
    borderRadius: 14,
    padding: "6px 8px 6px 16px",
    transition: "border-color 0.2s",
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: "'DM Sans', sans-serif",
    minHeight: 28,
    resize: "none",
    letterSpacing: "-0.005em",
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#3f3f46",
    marginTop: 8,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.01em",
  },
};

export default ChatBox;
