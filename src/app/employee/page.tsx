'use client';

import React from 'react';
import { EmployeeMobileApp } from '@/components/EmployeeMobileApp';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EmployeePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-950 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <Link
          href="/"
          className="flex items-center space-x-1.5 text-slate-300 hover:text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Operations Web Portal</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-mono text-slate-400">ATHARVA EMPLOYEE COMMUTE (LIVE)</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <EmployeeMobileApp />
      </main>
    </div>
  );
}

