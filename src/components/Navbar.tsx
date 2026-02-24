import { Database, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface NavbarProps {
  onLoginClick?: () => void;
  user?: User | null;
}

export default function Navbar({ onLoginClick, user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#040B16]/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-brand-green" />
          <span className="font-semibold text-lg tracking-tight hidden sm:block text-white">Automated Data Cleaning Pipeline</span>
          <span className="font-semibold text-lg tracking-tight sm:hidden text-white">ADC</span>
        </div>
        
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-md shadow-inner">
          <a href="#" className="px-4 py-1.5 rounded-full hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300">
            Home
          </a>
          <a href="#features" className="px-4 py-1.5 rounded-full hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300">
            Features
          </a>
          <a href="#pricing" className="px-4 py-1.5 rounded-full hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300">
            Plans
          </a>
          <a href="#contact" className="px-4 py-1.5 rounded-full hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button 
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm border border-white/10"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="hidden md:block bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-emerald-500/25"
            >
              Sign In
            </button>
          )}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#040B16]/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-2 text-sm font-medium text-gray-300">
              <a href="#" className="px-4 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="#features" className="px-4 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="px-4 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Plans</a>
              <a href="#contact" className="px-4 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
              <div className="pt-2">
                {user ? (
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors w-full border border-white/10"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { onLoginClick?.(); setIsMobileMenuOpen(false); }}
                    className="bg-gradient-to-r from-[#34d399] to-[#10b981] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors w-full"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
