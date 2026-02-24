import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface ChatbotProps {
  dataContext: any[];
}

export default function Chatbot({ dataContext }: ChatbotProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Hi! I am your AI Data Assistant. Upload data and ask me to analyze it, suggest cleaning steps, or perform specific EDA tasks.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Prepare context
      const sampleData = dataContext.slice(0, 5);
      const columns = dataContext.length > 0 ? Object.keys(dataContext[0]).join(', ') : 'No data uploaded yet.';
      const rowCount = dataContext.length;

      const prompt = `
        You are an expert Data Scientist assistant for an Automated Data Cleaning Pipeline app.
        Current Dataset Info:
        - Total Rows: ${rowCount}
        - Columns: ${columns}
        - Sample Data (first 5 rows): ${JSON.stringify(sampleData)}

        User Request: ${userMsg}

        Please provide a VERY short, concise answer (maximum 2 sentences). If asked for code, provide a tiny snippet. Focus only on the exact keyword or question asked.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'assistant', text: response.text || 'Sorry, I could not generate a response.' }]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Oops! Something went wrong connecting to the AI. Please check your API key and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#040B16]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-white' : 'bg-white/10 text-brand-green'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-white rounded-tr-sm' : 'bg-[#0B1121] border border-white/10 text-gray-300 rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 text-brand-green flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-[#0B1121] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#0B1121] border-t border-white/10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data..."
            className="w-full bg-[#040B16] border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-gradient-to-r from-[#34d399] to-[#10b981] text-white rounded-full hover:from-[#10b981] hover:to-[#059669] disabled:opacity-50 disabled:hover:from-[#34d399] transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
