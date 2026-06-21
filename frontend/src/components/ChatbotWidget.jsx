import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your **Made In Veedu** AI assistant. Ask me anything about our organic masalas, health mixes, traditional snacks, shipping, or how to track your order!", isBot: true }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = { text: textToSend, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const payload = {
        message: textToSend,
        user_id: isAuthenticated ? user.id : null
      };

      const res = await axios.post('http://localhost:8000/chat', payload);
      const botMsg = { text: res.data.reply, isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: "Sorry, I am facing trouble connecting to the AI brain right now. Please try again shortly!", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage(inputVal);
    }
  };

  const quickChips = [
    "Track my order",
    "Show products under ₹250",
    "Are mixes healthy?",
    "WELCOME20 coupon"
  ];

  // Helper to parse simple markdown bold strings in chat bubbles
  const formatText = (text) => {
    // replace **text** with <strong>text</strong>
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-emerald-800 dark:text-emerald-400">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/30 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat window panel */}
      {isOpen && (
        <div className="w-[360px] h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200/50 dark:border-emerald-950/30 glass-panel animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-emerald-800/10 dark:bg-emerald-950/20 border-b border-slate-200/30 dark:border-emerald-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand dark:text-brand-light animate-pulse" />
              <span className="font-semibold text-sm tracking-wide text-slate-800 dark:text-slate-100">Made In Veedu AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white/40 dark:bg-black/10">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.isBot
                      ? 'bg-slate-100/90 dark:bg-[#152515]/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/20'
                      : 'bg-brand text-white rounded-tr-none'
                  }`}
                >
                  {formatText(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100/90 dark:bg-[#152515]/80 rounded-2xl rounded-tl-none px-4 py-2 text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-neutral-800 overflow-x-auto flex gap-1.5 scrollbar-thin">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full border border-slate-200 dark:border-emerald-950/40 text-[10px] text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-[#122212]/50 hover:bg-brand hover:text-white dark:hover:bg-brand-dark transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input form */}
          <div className="p-3 bg-white/70 dark:bg-neutral-900/70 border-t border-slate-200/30 dark:border-neutral-800/30 flex gap-2">
            <input
              type="text"
              placeholder="Ask about snacks, shipping, orders..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none bg-slate-100 dark:bg-neutral-950/40 text-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-neutral-800/40 focus:ring-1 focus:ring-brand"
            />
            <button
              onClick={() => sendMessage(inputVal)}
              disabled={!inputVal.trim()}
              className="p-2 rounded-xl bg-brand hover:bg-brand-dark text-white disabled:bg-slate-200 dark:disabled:bg-neutral-800 disabled:text-slate-400 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
