import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface ChatbotProps {
  dataContext: any[];
  onVisualizationRequest?: (details: { type: string; column?: string; columns?: string[] }) => void;
}

export default function Chatbot({ dataContext, onVisualizationRequest }: ChatbotProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; analysis?: any }[]>([
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

      const systemInstruction = `
You are an AI Data Analyst Assistant. Your goal is to provide clear, concise answers to user questions about their data.

🧠 CORE RESPONSIBILITIES
1. Answer questions directly in the chat.
2. ONLY suggest a visualization if the user explicitly asks for one (e.g., "show me a graph", "visualize...") or if the question is specifically about distributions/relationships that require a chart.
3. If a question can be answered with a simple text explanation or a summary, do NOT recommend a chart.
4. Keep answers professional but concise.
5. 🛡️ SCOPE PROTECTION: If the user asks a question that is NOT related to the uploaded dataset, Exploratory Data Analysis (EDA), or data cleaning, you MUST respond with exactly this message: "You are asking out of the scope. Please ask about your dataset, I am here to help you with EDA and data analysis."

📦 RESPONSE FORMAT (STRICT JSON)
{
  "answer": "Your direct answer to the user's question.",
  "recommended_chart": "null or chart_name (only if a chart is truly needed)",
  "columns_used": ["column1", "column2"],
  "analysis_type": "univariate | bivariate | multivariate | none"
}
`;

      const prompt = `
        Current Dataset Info:
        - Total Rows: ${rowCount}
        - Columns: ${columns}
        - Sample Data (first 5 rows): ${JSON.stringify(sampleData)}

        User Request: ${userMsg}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: "The concise text answer to show in chat." },
              recommended_chart: { type: Type.STRING, nullable: true, description: "The chart type if needed, otherwise null." },
              columns_used: { type: Type.ARRAY, items: { type: Type.STRING } },
              analysis_type: { type: Type.STRING },
            },
            required: ["answer", "analysis_type"]
          }
        },
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.recommended_chart && result.recommended_chart !== "null" && onVisualizationRequest) {
        onVisualizationRequest({
          type: result.recommended_chart,
          column: result.columns_used?.[0],
          columns: result.columns_used,
        });
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: result.answer,
        analysis: result 
      }]);

    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Oops! Something went wrong connecting to the AI. Please check your API key and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#040B16] overflow-hidden h-full">
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
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm selectable-text ${msg.role === 'user' ? 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-white rounded-tr-sm' : 'bg-[#0B1121] border border-white/10 text-gray-300 rounded-tl-sm'}`}>
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

      <div className="p-4 bg-[#0B1121] border-t border-white/10 shrink-0">
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
