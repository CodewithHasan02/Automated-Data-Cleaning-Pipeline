import React from 'react';
import Hero from './Hero';
import { motion } from 'motion/react';
import { Sparkles, Clock, Shield, Zap, Mail, Phone, Database } from 'lucide-react';
import { User } from 'firebase/auth';

interface LandingPageProps {
  onGetStarted: () => void;
  user?: User | null;
}

export default function LandingPage({ onGetStarted, user }: LandingPageProps) {
  return (
    <div className="flex-1 overflow-y-auto relative z-10 pb-0">
      <Hero onGetStarted={onGetStarted} user={user} />

      {/* Features Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the next generation of data cleaning with our 3D cartoon animation guided interface that makes complex data wrangling fun and intuitive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-6 h-6 text-brand-green" />,
              title: "AI-Powered Cleaning",
              description: "Automatically detect and fix anomalies, missing values, and formatting issues with advanced machine learning."
            },
            {
              icon: <Clock className="w-6 h-6 text-brand-green" />,
              title: "Saves Lots of Time",
              description: "What used to take hours now takes seconds. Free up your schedule to focus on actual data analysis."
            },
            {
              icon: <Shield className="w-6 h-6 text-brand-green" />,
              title: "Secure & Private",
              description: "Your data never leaves your browser unless you want it to. Enterprise-grade security built-in."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0B1121] border border-white/10 rounded-2xl p-6 hover:border-brand-green/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-brand-green/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start for free today. In the future, there will be an affordable plan for power users and teams.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-b from-[#0B1121] to-[#040B16] border border-brand-green/30 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-brand-green text-[#040B16] text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Current
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Free Beta</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-extrabold text-white">$0</span>
              <span className="text-gray-400">/forever</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Unlimited CSV uploads",
                "AI-powered data cleaning",
                "Basic EDA visualizations",
                "Export cleaned data",
                "Interactive AI Assistant"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <Zap className="w-5 h-5 text-brand-green shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onGetStarted}
              className="w-full bg-white text-[#040B16] hover:bg-gray-100 py-3 rounded-xl font-semibold transition-colors"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center" id="contact">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Get in Touch</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <a href="mailto:hasan02rollno@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-brand-green transition-colors bg-[#0B1121] px-6 py-4 rounded-2xl border border-white/10 hover:border-brand-green/30">
            <Mail className="w-6 h-6" />
            <span className="text-lg">hasan02rollno@gmail.com</span>
          </a>
          <a href="tel:8268880065" className="flex items-center gap-3 text-gray-300 hover:text-brand-green transition-colors bg-[#0B1121] px-6 py-4 rounded-2xl border border-white/10 hover:border-brand-green/30">
            <Phone className="w-6 h-6" />
            <span className="text-lg">+91 8268880065</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#040B16] pt-16 pb-8 px-4 mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-brand-green" />
              <span className="font-semibold text-lg tracking-tight text-white">Automated Data Cleaning</span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Making data preparation effortless with AI-powered pipelines and an intuitive 3D guided interface.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#features" className="hover:text-brand-green transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-brand-green transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">API Reference</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-brand-green transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-green transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Automated Data Cleaning Pipeline. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
