import React, { useState } from "react";
import { sendMessage } from "../services/api";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const response = await sendMessage(input);

    const botMsg = { sender: "bot", text: response };
    setMessages(prev => [...prev, botMsg]);

    setInput("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>🤖 AI Assistant</h2>

      <div style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.sender === "user" ? "right" : "left",
            margin: "10px 0"
          }}>
            <span style={{
              background: msg.sender === "user" ? "#007bff" : "#eee",
              color: msg.sender === "user" ? "#fff" : "#000",
              padding: "8px",
              borderRadius: "10px",
              display: "inline-block"
            }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "80%" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default ChatBox;