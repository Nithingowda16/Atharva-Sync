'use client';

import React, { useState } from 'react';
import {
  Car,
  Navigation,
  Phone,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  KeyRound,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { QRScannerModal, ScannedBoardingData } from '@/components/QRScannerModal';
import { GoogleMapsTracker, LocationNode } from '@/components/GoogleMapsTracker';

export interface DriverPassenger {
  empCode: string;
  name: string;
  phone: string;
  pickup: string;
  seat: string;
  pin: string;
  status: 'WAITING' | 'BOARDED' | 'NO_SHOW';
  boardedAt?: string;
}

interface DriverMobileAppProps {
  driverName?: string;
  driverId?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  tripId?: string;
  shiftTime?: string;
  initialPassengers?: DriverPassenger[];
  onPassengerBoarded?: (empCode: string, pin: string) => void;
  onSwitchPortal?: (portal: 'vendor-portal' | 'admin-portal' | 'employee-app') => void;
  onTriggerSOS?: () => void;
}

export const DriverMobileApp: React.FC<DriverMobileAppProps> = ({
  driverName = 'Suresh Babu',
  driverId = 'DRV-3012',
  vehiclePlate = 'KA-03-HA-8821',
  vehicleModel = 'Toyota Innova Crysta',
  tripId = 'TRP-9021',
  shiftTime = '08:30 AM Shift • Login',
  initialPassengers = [
    {
      empCode: 'EMP-8492',
      name: 'Harish R.',
      phone: '+91 98450 11200',
      pickup: 'Indiranagar Metro Station (100 Feet Rd)',
      seat: '1A',
      pin: '8492',
      status: 'WAITING',
    },
    {
      empCode: 'EMP-8493',
      name: 'Bhaskar N.',
      phone: '+91 98450 11201',
      pickup: 'Koramangala 4th Block (Sony World Jxn)',
      seat: '1B',
      pin: '5120',
      status: 'WAITING',
    },
    {
      empCode: 'EMP-8494',
      name: 'Hemaraj K.',
      phone: '+91 98450 11202',
      pickup: 'HSR Layout Sector 1 (Ring Rd)',
      seat: '2A',
      pin: '3914',
      status: 'WAITING',
    },
  ],
  onPassengerBoarded,
  onSwitchPortal,
  onTriggerSOS,
}) => {
  const [passengers, setPassengers] = useState<DriverPassenger[]>(initialPassengers);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'map'>('roster');
  const [tripState, setTripState] = useState<'NOT_STARTED' | 'EN_ROUTE' | 'COMPLETED'>('EN_ROUTE');
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Calculate boarded count
  const boardedCount = passengers.filter((p) => p.status === 'BOARDED').length;
  const totalCount = passengers.length;

  // Handle successful QR Scan or PIN verification
  const handleScanSuccess = (scanned: ScannedBoardingData) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.empCode === scanned.empId || p.pin === scanned.pin) {
          return {
            ...p,
            status: 'BOARDED',
            boardedAt: scanned.verifiedAt,
          };
        }
        return p;
      })
    );

    setRecentNotification(`✅ ${scanned.empName} (${scanned.empId}) verified & boarded at ${scanned.verifiedAt}!`);
    setTimeout(() => setRecentNotification(null), 4000);

    if (onPassengerBoarded) {
      onPassengerBoarded(scanned.empId, scanned.pin);
    }
  };

  // Quick 1-tap manual board toggle from roster
  const handleToggleBoardStatus = (empCode: string) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.empCode === empCode) {
          const nextStatus = p.status === 'BOARDED' ? 'WAITING' : 'BOARDED';
          return {
            ...p,
            status: nextStatus,
            boardedAt: nextStatus === 'BOARDED' ? new Date().toLocaleTimeString() : undefined,
          };
        }
        return p;
      })
    );
  };

  // Reset all passengers for demo purposes
  const handleResetRoster = () => {
    setPassengers((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'WAITING',
        boardedAt: undefined,
      }))
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-100 min-h-screen font-sans">
      
      {/* Top Device Switcher / Helper Toolbar */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between bg-white border border-slate-300 p-2 shadow-sm text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Car className="w-4 h-4 text-emerald-600" />
          <span>Driver Operations Terminal</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {onSwitchPortal && (
            <button
              onClick={() => onSwitchPortal('employee-app')}
              className="text-[11px] px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Employee App ➔
            </button>
          )}
        </div>
      </div>

      {/* Main Driver Terminal Card */}
      <div className="w-full max-w-lg bg-white border-4 border-slate-900 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Terminal Status Bar */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-black text-xs tracking-wider">
              DRIVER TERMINAL • {vehiclePlate}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-2 py-0.5 border border-slate-700">
              TRIP: {tripId}
            </span>
          </div>
        </div>

        {/* Driver Profile Header */}
        <div className="bg-slate-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow">
                {driverName.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-base leading-tight text-white">{driverName}</h3>
                <p className="text-xs text-slate-400">
                  ID: <span className="font-mono text-slate-200">{driverId}</span> • {vehicleModel}
                </p>
                <p className="text-[11px] text-amber-300 font-semibold">{shiftTime}</p>
              </div>
            </div>

            {/* Boarding Counter Pill */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                ONBOARD
              </span>
              <span className="inline-block bg-emerald-500 text-white font-black text-base px-3 py-1 shadow">
                {boardedCount} / {totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* HIGH-IMPACT SCANNER ACTION BAR */}
        <div className="bg-slate-900 p-3.5 border-b border-slate-800 flex items-center space-x-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
          >
            <Scan className="w-5 h-5 text-white" />
            <span>📷 OPEN BOARDING QR SCANNER</span>
          </button>
        </div>

        {/* Real-time Notification Banner */}
        {recentNotification && (
          <div className="bg-emerald-50 border-y border-emerald-400 text-emerald-900 p-2.5 text-xs font-bold text-center animate-fade-in flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{recentNotification}</span>
          </div>
        )}

        {/* View Switcher Tabs: Roster vs Live Route */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('roster')}
            className={`py-2.5 px-4 flex items-center justify-center space-x-1.5 transition-colors ${
              activeTab === 'roster'
                ? 'bg-white text-blue-700 border-b-2 border-b-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Passenger Roster ({boardedCount}/{totalCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-2.5 px-4 flex items-center justify-center space-x-1.5 transition-colors ${
              activeTab === 'map'
                ? 'bg-white text-blue-700 border-b-2 border-b-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route Map & Directions</span>
          </button>
        </div>

        {/* Tab 1: PASSENGER MANIFEST & ROSTER */}
        {activeTab === 'roster' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-200">
              <span className="font-bold uppercase tracking-wider">
                Pickup Order & Verification
              </span>
              <button
                onClick={handleResetRoster}
                className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {passengers.map((passenger, idx) => (
                <div
                  key={passenger.empCode}
                  className={`p-3 border-2 transition-all ${
                    passenger.status === 'BOARDED'
                      ? 'bg-emerald-50/70 border-emerald-500'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`w-7 h-7 font-black text-xs flex items-center justify-center shadow-sm shrink-0 ${
                          passenger.status === 'BOARDED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {passenger.seat}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-xs text-slate-900">
                            {passenger.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({passenger.empCode})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                          {passenger.pickup}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0 text-right">
                      {passenger.status === 'BOARDED' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>BOARDED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>WAITING</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passenger Bottom Actions */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                      <span>PIN: <strong className="font-mono text-slate-900">{passenger.pin}</strong></span>
                      <a
                        href={`tel:${passenger.phone}`}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 ml-2"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>

                    <button
                      onClick={() => handleToggleBoardStatus(passenger.empCode)}
                      className={`text-[11px] font-bold px-2.5 py-1 border transition-colors ${
                        passenger.status === 'BOARDED'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      }`}
                    >
                      {passenger.status === 'BOARDED' ? 'Revert to Waiting' : 'Mark Boarded ➔'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: LIVE ROUTE MAP & DIRECTIONS */}
        {activeTab === 'map' && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
              <span className="font-bold text-slate-700">Driver Turn-by-Turn Navigation</span>
              <span className="text-[11px] text-blue-600 font-bold">Bangalore Corridor</span>
            </div>

            <div className="border border-slate-200 overflow-hidden shadow-sm">
              <GoogleMapsTracker
                pickupCoords={{ latitude: 12.9719, longitude: 77.6412 }}
                pickupAddress="Indiranagar Metro Station (Stop 1)"
                driverCoords={{ latitude: 12.9760, longitude: 77.6320 }}
                vehiclePlate={vehiclePlate}
                driverName={driverName}
              />
            </div>
          </div>
        )}

        {/* DRIVER TRIP CONTROLS & SOS FOOTER */}
        <div className="bg-slate-900 p-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (onTriggerSOS) onTriggerSOS();
              alert('🚨 DRIVER PANIC TRIGGERED: Emergency beacon broadcasted to Atharva Control Room!');
            }}
            className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center space-x-1.5 transition-colors shadow"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>DRIVER SOS</span>
          </button>

          <button
            onClick={() => {
              if (boardedCount < totalCount) {
                if (confirm(`Notice: ${totalCount - boardedCount} passengers are not boarded yet. Complete trip to campus?`)) {
                  setTripState('COMPLETED');
                  alert('Trip marked COMPLETED. Campus Gate Logged!');
                }
              } else {
                setTripState('COMPLETED');
                alert('All passengers boarded! Trip completed at Campus Hub.');
              }
            }}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPLETE TRIP AT CAMPUS</span>
          </button>
        </div>

      </div>

      {/* QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        expectedTripId={tripId}
        pendingPassengers={passengers
          .filter((p) => p.status === 'WAITING')
          .map((p) => ({
            empCode: p.empCode,
            name: p.name,
            pin: p.pin,
            seat: p.seat,
            pickup: p.pickup,
          }))}
      />

    </div>
  );
};
