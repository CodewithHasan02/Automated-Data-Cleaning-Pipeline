/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [started, setStarted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setShowAuth(false);
      } else {
        setUser(null);
        setStarted(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      setStarted(true);
    } else {
      setShowAuth(true);
    }
  };

  const handleHomeClick = () => {
    setStarted(false);
  };

  const handleDashboardClick = () => {
    if (user) {
      setStarted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-white relative">
      {/* Background streaks effect */}
      <div className="bg-streaks"></div>
      
      <Navbar 
        onLoginClick={() => setShowAuth(true)} 
        user={user} 
        onHomeClick={handleHomeClick}
        onDashboardClick={handleDashboardClick}
        isDashboardView={started}
      />

      <div className="flex-1 flex flex-col pt-[72px]">
        {!started ? (
          <LandingPage onGetStarted={handleGetStarted} user={user} />
        ) : (
          <div className="relative z-10 flex-1 flex flex-col">
            <Dashboard />
          </div>
        )}
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </div>
  );
}
