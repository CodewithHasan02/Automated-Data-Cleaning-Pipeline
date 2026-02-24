import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';

interface HeroProps {
  onGetStarted: () => void;
  user?: User | null;
}

export default function Hero({ onGetStarted, user }: HeroProps) {
  return (
    <main className="flex flex-col items-center text-center pt-24 pb-32 px-4 max-w-4xl mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f172a]/80 border border-white/10 text-gray-300 text-xs font-semibold tracking-wide uppercase mb-8 shadow-lg backdrop-blur-sm"
      >
        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
        AI-POWERED CLEANING
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
      >
        Supercharge Your Data <br className="hidden md:block" />
        with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-[#10b981]">AI-Powered Pipelines</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl font-light"
      >
        The Automated Data Cleaning Pipeline leverages advanced AI to instantly clean, format, and prepare your datasets. It saves you lots of time by eliminating manual data wrangling, allowing you to focus on driving insights.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <button 
          onClick={onGetStarted}
          className="flex items-center gap-2 bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-white px-8 py-4 rounded-full text-base font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
        >
          {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </main>
  );
}
