'use client';

import React from 'react';
import { UserRole } from '@/types/ets';
import { ShieldAlert, Bell, LogOut, Bus, MapPin } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSos: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, onOpenSos }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Campus */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 text-blue-800">
            <div className="bg-blue-800 text-white p-2 rounded-lg">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">NEXUS</span>
              <span className="text-lg font-black text-blue-600 ml-1">ETS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>Bengaluru Tech Campus (B-4)</span>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-1 text-xs font-semibold">
            <span className="text-blue-900 px-2">Role:</span>
            <button
              onClick={() => onRoleChange('EMPLOYEE')}
              className={`px-3 py-1 rounded-md transition-all ${
                currentRole === 'EMPLOYEE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-800 hover:bg-blue-100'
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => onRoleChange('DRIVER')}
              className={`px-3 py-1 rounded-md transition-all ${
                currentRole === 'DRIVER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-800 hover:bg-blue-100'
              }`}
            >
              Driver Console
            </button>
            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`px-3 py-1 rounded-md transition-all ${
                currentRole === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-800 hover:bg-blue-100'
              }`}
            >
              Admin Dispatch
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSos}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-md shadow-sm transition-all animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS / EMERGENCY</span>
          </button>

          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center font-bold text-xs text-blue-800">
              {currentRole === 'EMPLOYEE' ? 'AR' : currentRole === 'DRIVER' ? 'SB' : 'AD'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800">
                {currentRole === 'EMPLOYEE'
                  ? 'Amrutha Rao'
                  : currentRole === 'DRIVER'
                  ? 'Suresh Babu'
                  : 'Admin Command'}
              </p>
              <p className="text-slate-400">
                {currentRole === 'EMPLOYEE'
                  ? 'EMP-9042'
                  : currentRole === 'DRIVER'
                  ? 'KA-03-HA-8821'
                  : 'Central TCR'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

