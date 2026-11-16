import React, { useState } from 'react';
import { useOnboarding } from './hooks/useOnboarding';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { authService } from './services/authService';
import { LogOut, RotateCcw, CheckCircle, Car, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';

export default function App() {
  const {
    isOnboarded,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    resetOnboarding,
  } = useOnboarding(3);

  const [currentView, setCurrentView] = useState('auth'); // 'auth' | 'forgot-password' | 'dashboard'
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('auth');
  };

  // Render Onboarding if not completed yet
  if (!isOnboarded) {
    return (
      <div className="w-full min-h-[100dvh] bg-black flex justify-center">
        <div className="w-full max-w-[430px] min-h-[100dvh] flex flex-col bg-black shadow-2xl">
          <Onboarding
            currentStep={currentStep}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={completeOnboarding}
          />
        </div>
      </div>
    );
  }

  // Render Forgot Password
  if (currentView === 'forgot-password') {
    return (
      <div className="w-full min-h-[100dvh] bg-black flex justify-center">
        <div className="w-full max-w-[430px] min-h-[100dvh] flex flex-col bg-black shadow-2xl">
          <ForgotPassword onBack={() => setCurrentView('auth')} />
        </div>
      </div>
    );
  }

  // Render Authenticated Commute Dashboard (when logged in)
  if (currentView === 'dashboard' && currentUser) {
    return (
      <div className="w-full min-h-[100dvh] bg-black text-white flex justify-center">
        <div className="w-full max-w-[430px] min-h-[100dvh] flex flex-col bg-[#0A0C10] p-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between pt-3 pb-5 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-1.5 font-black text-lg">
                <span className="text-white">HI</span>
                <span className="text-[#FF7900]">RIDERS</span>
              </div>
              <p className="text-xs text-neutral-400">Welcome, {currentUser.fullName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Today's Commute Active Card */}
          <div className="mt-5 bg-gradient-to-br from-[#12151D] to-[#181C26] border border-[#262C3D] rounded-3xl p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En Route
              </span>
              <span className="text-neutral-400 text-xs font-semibold">13:30 Shift</span>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FF7900]/20 text-[#FF7900] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Pickup Stop</p>
                  <p className="text-sm font-bold text-white">Gate 2, Golden Palms Apts, Indiranagar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Assigned Vehicle</p>
                  <p className="text-sm font-bold text-white">KA-03-HA-8821 • Toyota Innova Crysta</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Driver: Suresh Babu (+91 98765 43210)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Safe Boarding PIN</p>
                  <p className="text-base font-black tracking-widest text-[#FF7900]">7492</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="mt-6 text-left">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 ml-1">
              Onboarding Controls
            </h3>
            <button
              onClick={resetOnboarding}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#12151D] border border-neutral-800 hover:border-[#FF7900]/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-[#FF7900] flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Replay Onboarding Walkthrough</p>
                  <p className="text-xs text-neutral-400">Review the 3 introductory brand screens</p>
                </div>
              </div>
              <span className="text-neutral-500 text-lg">›</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Employee Login Screen
  return (
    <div className="w-full min-h-[100dvh] bg-black flex justify-center">
      <div className="w-full max-w-[430px] min-h-[100dvh] flex flex-col bg-black shadow-2xl">
        <Login
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      </div>
    </div>
  );
}

