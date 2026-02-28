import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RotateCcw } from "lucide-react";
import { quickReplies, welcomeMessage } from "../data/collegeKnowledge";
interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    return (
      <span key={i}>
        {formatted}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 p-3">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isBot = message.role === "bot";
  return (
    <div className={`flex gap-2 my-2 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
        {isBot ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
          isBot ? "bg-gray-100 text-gray-800" : "bg-blue-600 text-white"
        }`}
      >
        {formatMessage(message.content)}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askBackend = async (question: string): Promise<string> => {
    try {
      const res = await fetch("http://localhost:3001/chat",  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      return data.answer;
    } catch (error) {
      return "Error connecting to server.";
    }
  };

  const sendMessage = async (text: string) => {
    
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const answer = await askBackend(text);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      content: answer,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border rounded-xl overflow-hidden shadow-lg">
      {/* HEADER */}
      <div className="bg-blue-900 text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">BSIOTR Assistant</span>
        </div>
        <button onClick={() => setMessages([])} title="Reset chat">
          <RotateCcw size={18} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK REPLIES */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-gray-50">
        {quickReplies.map(reply => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            className="bg-gray-200 px-3 py-1 rounded-full text-sm whitespace-nowrap hover:bg-gray-300"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex items-center gap-2 px-4 py-3 border-t bg-white">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask anything..."
          className="flex-1 border px-3 py-2 rounded-full outline-none text-sm"
        />
        <button
          onClick={() => sendMessage(input)}
          className="bg-blue-900 text-white p-2 rounded-full hover:bg-blue-800"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}