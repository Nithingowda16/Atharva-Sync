'use client';

import React, { useState } from 'react';
import {
  Car,
  Navigation,
  Phone,
  MessageSquare,
  Shield,
  ShieldAlert,
  Share2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Smartphone,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { QRCodeBadge } from '@/components/QRCodeBadge';
import { LocationNode } from '@/components/GoogleMapsTracker';

interface EmployeeMobileAppProps {
  employeeName?: string;
  employeeCode?: string;
  companyName?: string;
  tripId?: string;
  pickupAddress?: string;
  pickupCoords?: { latitude: number; longitude: number };
  vehiclePlate?: string;
  vehicleModel?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: string;
  boardingPin?: string;
  isBoarded?: boolean;
  onSimulateBoarding?: () => void;
  onRequestLocationChange?: () => void;
  onTriggerSOS?: () => void;
  onSwitchPortal?: (portal: 'vendor-portal' | 'admin-portal' | 'driver-app') => void;
}

export const EmployeeMobileApp: React.FC<EmployeeMobileAppProps> = ({
  employeeName = 'Harish R.',
  employeeCode = 'EMP-8492',
  companyName = 'Atharva Corporate Mobility',
  tripId = 'TRP-9021',
  pickupAddress = 'Indiranagar Metro Station (100 Feet Rd), Bengaluru',
  pickupCoords = { latitude: 12.9719, longitude: 77.6412 },
  vehiclePlate = 'KA-03-HA-8821',
  vehicleModel = 'Toyota Innova Crysta (White AC)',
  driverName = 'Suresh Babu',
  driverPhone = '+91 98450 22194',
  driverRating = '4.9 ★',
  boardingPin = '8492',
  isBoarded = false,
  onSimulateBoarding,
  onRequestLocationChange,
  onTriggerSOS,
  onSwitchPortal,
}) => {
  const [boardedState, setBoardedState] = useState<boolean>(isBoarded);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('mobile-frame');

  // Payload encoded inside Employee QR Code
  const qrPayload = JSON.stringify({
    type: 'ATHARVA_BOARDING_PASS',
    empCode: employeeCode,
    name: employeeName,
    tripId: tripId,
    pin: boardingPin,
    pickup: pickupAddress,
    validUntil: new Date(Date.now() + 3600000).toISOString(),
  });

  const handleBoardToggle = () => {
    const next = !boardedState;
    setBoardedState(next);
    if (onSimulateBoarding) onSimulateBoarding();
  };

  const handleShareTrip = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Atharva ETS Live Commute: ${employeeName} is travelling in Cab ${vehiclePlate} (${driverName} - ${driverPhone}). Live ETA: 8 mins.`
      );
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-100 min-h-screen font-sans">
      
      {/* Top Device Switcher / Helper Toolbar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between bg-white border border-slate-300 p-2 shadow-sm text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>Employee Commuter App</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'mobile-frame' ? 'responsive' : 'mobile-frame')}
            className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-semibold"
          >
            {viewMode === 'mobile-frame' ? 'Expand Fullscreen' : 'Mobile Shell'}
          </button>
          {onSwitchPortal && (
            <button
              onClick={() => onSwitchPortal('driver-app')}
              className="text-[11px] px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Driver View ➔
            </button>
          )}
        </div>
      </div>

      {/* Main Employee App Shell (Mobile Frame Simulator) */}
      <div
        className={`w-full transition-all ${
          viewMode === 'mobile-frame'
            ? 'max-w-md bg-white border-4 border-slate-900 shadow-2xl overflow-hidden'
            : 'max-w-4xl bg-white border border-slate-300 shadow-lg'
        }`}
      >
        
        {/* App Status Bar */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold tracking-wider text-[11px]">ATHARVA MOBILITY</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* User Identity Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-white text-blue-800 font-black text-sm flex items-center justify-center border-2 border-blue-300 shadow">
                {employeeName.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-base leading-tight">{employeeName}</h3>
                <p className="text-xs text-blue-200">
                  {employeeCode} • {companyName}
                </p>
              </div>
            </div>

            {/* Boarding Status Pill */}
            <div className="text-right">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                  boardedState
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-amber-400 text-slate-950 shadow'
                }`}
              >
                {boardedState ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Boarded</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Pickup</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 space-y-4">
          
          {/* Active Trip Header */}
          <div className="bg-slate-50 border border-slate-200 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wide">
                Today&apos;s Dispatch • {tripId}
              </span>
              <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5">
                08:30 AM SHIFT • LOGIN
              </span>
            </div>

            {/* Pickup & Drop Points */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Node:</span>
                  <strong className="text-slate-900 block leading-tight">{pickupAddress}</strong>
                </div>
              </div>
              <div className="flex items-start space-x-2 pt-1 border-t border-slate-200">
                <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination:</span>
                  <strong className="text-slate-900 block leading-tight">
                    Nexus Tech Park (Bellandur Hub Gate 2)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* DRIVER & CAB DETAILS CARD */}
          <div className="bg-white border-2 border-slate-900 p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
                  <Car className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">{driverName}</h4>
                  <p className="text-xs text-slate-500">
                    Atharva Chauffeur • <span className="text-emerald-700 font-bold">{driverRating}</span>
                  </p>
                </div>
              </div>

              {/* Vehicle Number Plate */}
              <div className="bg-amber-300 border-2 border-slate-900 px-2.5 py-1 text-center shadow-sm">
                <span className="text-[9px] uppercase font-black text-slate-800 block leading-none">IND</span>
                <span className="font-mono font-black text-xs text-slate-950 tracking-wider">
                  {vehiclePlate}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2 border border-slate-200">
              Vehicle: <strong>{vehicleModel}</strong>
            </p>

            {/* Quick Action Buttons for Driver */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`tel:${driverPhone}`}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Driver</span>
              </a>
              <button
                onClick={handleShareTrip}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Share Ride</span>
              </button>
            </div>
          </div>

          {/* QR BOARDING BADGE CARD */}
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Contactless Boarding Badge</span>
            </h4>

            {/* Dynamic QR Code Badge Component */}
            <QRCodeBadge
              payload={qrPayload}
              pin={boardingPin}
              size={180}
              label={boardedState ? 'BOARDING VERIFIED' : 'READY FOR DRIVER SCAN'}
              sublabel="Hold phone screen toward Driver's scanner upon boarding"
            />

            {/* One-Tap Simulation Button for User / Demoer */}
            <div className="mt-3 w-full max-w-[280px]">
              <button
                onClick={handleBoardToggle}
                className={`w-full py-2 px-3 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm ${
                  boardedState
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {boardedState ? 'Simulate Revert to Waiting' : '⚡ Simulate Driver Scan & Boarding'}
                </span>
              </button>
            </div>
          </div>

          {/* EMERGENCY SOS & SUPPORT ACTIONS */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                if (onTriggerSOS) onTriggerSOS();
                alert('🚨 EMERGENCY SOS DISPATCHED: 24/7 Atharva Command Center notified! Live GPS broadcasted to Security Response Team.');
              }}
              className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>EMERGENCY SOS</span>
            </button>

            {onRequestLocationChange && (
              <button
                onClick={onRequestLocationChange}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Change Pickup</span>
              </button>
            )}
          </div>

          {/* Share Toast Notification */}
          {showShareToast && (
            <div className="p-2 bg-emerald-50 border border-emerald-400 text-emerald-800 text-xs text-center font-bold animate-fade-in">
              Ride tracking link copied to clipboard! Share with family or team.
            </div>
          )}

        </div>

        {/* App Footer */}
        <div className="bg-slate-100 p-3 text-center border-t border-slate-200 text-[10px] text-slate-500">
          Atharva ETS Commuter App v2.4 • Powered by Atharva Travels Pvt Ltd
        </div>

      </div>

    </div>
  );
};
