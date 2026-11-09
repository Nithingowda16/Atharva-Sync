'use client';

import React from 'react';
import {
  Wrench,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Mail,
  RefreshCw,
  Server,
  Zap,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface UnderMaintenanceProps {
  currentUser?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    companyName?: string;
    staffCode?: string;
  } | null;
  onLogout: () => void;
  onBypass?: () => void;
}

export function UnderMaintenance({ currentUser, onLogout }: UnderMaintenanceProps) {
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
      <header className="relative z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
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

        <div className="flex items-center space-x-3">
          {currentUser && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>
                <strong>{currentUser.fullName}</strong>
                {currentUser.companyName ? ` • ${currentUser.companyName}` : ''}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-4xl mx-auto w-full text-center">
        
        {/* Floating Icon Box */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0f5fc2] shadow-sm">
            <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-[#0f5fc2] animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 shadow">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>System Maintenance &amp; Upgrades In Progress</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Portal Under Scheduled Maintenance
        </h1>

        {/* Detailed Explanation with User context */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mb-8">
          {currentUser ? (
            <>
              Welcome, <strong className="text-slate-800">{currentUser.fullName}</strong>. Your account has been authenticated successfully.
              The operational dispatch dashboards and fleet monitoring modules are currently 
              offline for scheduled system upgrades and database optimization.
            </>
          ) : (
            <>
              The centralized fleet dispatch command center is undergoing planned production 
              deployments and compliance infrastructure hardening. Full operational dashboards 
              will be accessible once deployment concludes.
            </>
          )}
        </p>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-8 text-left">
          
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

        {/* Quick Actions (Sign Out Only - Zero Dashboard Access) */}
        <div className="flex items-center justify-center mb-8">
          <button
            type="button"
            onClick={onLogout}
            className="px-6 py-2.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-sm flex items-center space-x-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Return to Login Screen</span>
          </button>
        </div>

        {/* Estimated Restoration & Helpdesk Contact */}
        <div className="w-full max-w-2xl bg-white border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-2 text-slate-700 font-medium">
            <Clock className="w-4 h-4 text-[#0f5fc2]" />
            <span>Expected Go-Live: <strong>Within 72 Hours</strong></span>
          </div>
          
          <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
            <a 
              href="mailto:support@atharvatravels.com" 
              className="flex items-center space-x-1 text-slate-600 hover:text-[#0f5fc2] font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>support@atharvatravels.com</span>
            </a>
          </div>
        </div>

      </main>

      {/* Clean Footer Bar */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-3.5 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Atharva Travels. All rights reserved. Enterprise Transport System.
      </footer>

    </div>
  );
}
