import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Change this to your backend URL when deploying

export default function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    socket.on("chat-started", () => {
      setWaiting(false);
      setMessages([]);
    });

    socket.on("waiting", () => setWaiting(true));

    socket.on("message", (msg) => setMessages((prev) => [...prev, { text: msg, me: false }]));

    socket.on("partner-disconnected", () => {
      alert("Partner disconnected. Searching for a new chat...");
      setWaiting(true);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("message", input);
      setMessages((prev) => [...prev, { text: input, me: true }]);
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      {waiting ? <p>Waiting for a chat partner...</p> : null}
      <div className="chat-box">
        {messages.map((msg, i) => (
          <p key={i} className={msg.me ? "sent" : "received"}>
            {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        disabled={waiting}
      />
      <button onClick={sendMessage} disabled={waiting}>
        Send
      </button>
    </div>
  );
}
