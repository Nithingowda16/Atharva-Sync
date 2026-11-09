'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  ShieldCheck,
  Radio,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';

interface UnderMaintenanceProps {
  onBypass: () => void;
}

export function UnderMaintenance({ onBypass }: UnderMaintenanceProps) {
  const [showPassModal, setShowPassModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authorized developer/staff bypass code
    const validCodes = ['ATHARVA', 'ATH-SYNC', 'DEVELOPER', 'ADMIN123', 'PREVIEW'];
    if (validCodes.includes(passcode.trim().toUpperCase())) {
      onBypass();
    } else {
      setPassError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Atharva Travels"
            className="h-9 sm:h-10 w-auto object-contain mix-blend-multiply"
          />
          <div className="hidden sm:block h-5 w-[1px] bg-slate-300" />
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Atharva Sync • Enterprise Transport System
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-2" />
            MAINTENANCE MODE ACTIVE
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full text-center">
        
        {/* Floating Icon Box */}
        <div className="relative mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0f5fc2] shadow-sm">
            <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-[#0f5fc2] animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 shadow">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-100 text-[#0f5fc2] text-xs font-bold uppercase tracking-wider">
          <Server className="w-3.5 h-3.5" />
          <span>System Optimization &amp; Deployment Underway</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          We&apos;re Upgrading the Atharva Sync Platform
        </h1>

        {/* Detailed Explanation */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mb-8">
          The centralized corporate fleet dispatch command center is undergoing planned production 
          deployments and compliance infrastructure hardening. Public access to operational 
          dashboards is temporarily restricted while new updates are provisioned.
        </p>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-10 text-left">
          
          <div className="bg-white border border-slate-200 p-4 shadow-sm flex items-start space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Fleet Core Engine</div>
              <div className="text-[11px] text-slate-500">v2.4 Build Verified</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 shadow-sm flex items-start space-x-3">
            <div className="p-2 bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Dispatch Automation</div>
              <div className="text-[11px] text-amber-700 font-medium">Syncing Production DB</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 shadow-sm flex items-start space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Security &amp; RBAC</div>
              <div className="text-[11px] text-slate-500">Statutory Compliant</div>
            </div>
          </div>

        </div>

        {/* Estimated Restoration & Helpdesk Contact */}
        <div className="w-full max-w-2xl bg-white border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-2 text-slate-700 font-medium">
            <Clock className="w-4 h-4 text-[#0f5fc2]" />
            <span>Expected Go-Live: <strong>Scheduled Release Cycle</strong></span>
          </div>
          
          <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
            <a 
              href="mailto:support@atharvatravels.com" 
              className="flex items-center space-x-1 text-slate-600 hover:text-[#0f5fc2] font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>

      </main>

      {/* Footer Bar with Discreet Authorized Personnel Access */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          &copy; {new Date().getFullYear()} Atharva Travels. All rights reserved. Enterprise Transport System.
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowPassModal(true)}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-700 transition-colors py-1 px-2 border border-transparent hover:border-slate-200"
            title="Authorized Developers & Staff"
          >
            <Lock className="w-3 h-3" />
            <span className="text-[11px]">Authorized Staff Access</span>
          </button>
        </div>
      </footer>

      {/* Authorized Staff Passcode Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Lock className="w-4 h-4 text-[#0f5fc2]" />
                <span>Developer &amp; Staff Bypass</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPassModal(false);
                  setPassError(false);
                  setPasscode('');
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              Enter your developer access code to preview and continue building the live portal in production.
            </p>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Access Code
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPassError(false);
                  }}
                  placeholder="Enter access code"
                  className="w-full text-sm border border-slate-300 px-3 py-2 focus:outline-none focus:border-[#0f5fc2] font-mono"
                />
                {passError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Invalid access code. Please try again.</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPassModal(false);
                    setPassError(false);
                    setPasscode('');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0f5fc2] hover:bg-blue-700 shadow-sm flex items-center space-x-1.5"
                >
                  <span>Unlock Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="border-t border-slate-100 pt-3 text-center">
              <span className="text-[11px] text-slate-400">
                Staff passcode: <code className="bg-slate-100 px-1 py-0.5 text-slate-600 font-mono">ATHARVA</code> or <code className="bg-slate-100 px-1 py-0.5 text-slate-600 font-mono">ADMIN123</code>
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
