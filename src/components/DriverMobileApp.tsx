'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Play,
  Check,
  X,
  Radio,
} from 'lucide-react';
import { QRScannerModal, ScannedBoardingData } from '@/components/QRScannerModal';
import { GoogleMapsTracker, LocationNode } from '@/components/GoogleMapsTracker';

export interface DriverPassenger {
  id?: string;
  empCode: string;
  name: string;
  phone: string;
  pickup: string;
  seat: string;
  pin: string;
  status: 'WAITING' | 'BOARDED' | 'NO_SHOW';
  boardedAt?: string;
  noShowReason?: string;
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
  driverName: defaultDriverName = 'Suresh Babu',
  driverId: defaultDriverId = 'drv-suresh',
  vehiclePlate: defaultPlate = 'KA-03-HA-8821',
  vehicleModel: defaultModel = 'Toyota Innova Crysta',
  tripId: defaultTripId = 'trip-ath-8821',
  shiftTime: defaultShiftTime = '13:30 Shift • Login',
  onPassengerBoarded,
  onSwitchPortal,
  onTriggerSOS,
}) => {
  const [driverName, setDriverName] = useState(defaultDriverName);
  const [driverId, setDriverId] = useState(defaultDriverId);
  const [vehiclePlate, setVehiclePlate] = useState(defaultPlate);
  const [vehicleModel, setVehicleModel] = useState(defaultModel);
  const [tripId, setTripId] = useState(defaultTripId);
  const [tripCode, setTripCode] = useState('ATH-2026-00124');
  const [shiftTime, setShiftTime] = useState(defaultShiftTime);
  const [passengers, setPassengers] = useState<DriverPassenger[]>([]);
  const [tripStatus, setTripStatus] = useState<string>('IN_TRANSIT');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'map'>('roster');
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  const [manualPinModal, setManualPinModal] = useState<{ open: boolean; passenger: DriverPassenger | null }>({
    open: false,
    passenger: null,
  });
  const [pinInput, setPinInput] = useState('');
  const [noShowModal, setNoShowModal] = useState<{ open: boolean; passenger: DriverPassenger | null }>({
    open: false,
    passenger: null,
  });
  const [noShowReason, setNoShowReason] = useState('Passenger not present at pickup location');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [telemetryActive, setTelemetryActive] = useState(true);

  // 1. Fetch live trip manifest from unified database
  const fetchManifest = async () => {
    try {
      const res = await fetch(`/api/mobile/driver/trip-manifest?driverId=${encodeURIComponent(driverId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tripManifest) {
          const m = data.tripManifest;
          setTripId(m.tripId);
          setTripCode(m.tripCode);
          setVehiclePlate(m.vehiclePlate);
          setVehicleModel(m.vehicleModel);
          setDriverName(m.driverName);
          setShiftTime(`${m.shiftTime} Shift • ${m.type}`);
          setTripStatus(m.status);

          const mapped: DriverPassenger[] = m.stops.map((s: any, idx: number) => ({
            id: s.id,
            empCode: s.empCode || `EMP-${1000 + idx}`,
            name: s.name,
            phone: s.phone,
            pickup: s.pickupAddress,
            seat: `${idx + 1}${idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}`,
            pin: s.pin,
            status: s.boardingStatus === 'BOARDED' ? 'BOARDED' : s.boardingStatus === 'NO_SHOW' ? 'NO_SHOW' : 'WAITING',
            boardedAt: s.boardingStatus === 'BOARDED' ? 'Boarded' : undefined,
            noShowReason: s.noShowReason,
          }));
          setPassengers(mapped);
        }
      }
    } catch (e) {
      console.warn('Could not fetch live driver manifest:', e);
    }
  };

  useEffect(() => {
    fetchManifest();
    const interval = setInterval(fetchManifest, 3000);
    return () => clearInterval(interval);
  }, [driverId]);

  // 2. Periodic Live GPS Telemetry Stream (Simulated or Real Geolocation)
  useEffect(() => {
    if (!telemetryActive || !tripId || !['IN_TRANSIT', 'TRIP_STARTED', 'DRIVER_ARRIVED'].includes(tripStatus)) {
      return;
    }

    let step = 0;
    const baseLat = 12.9719;
    const baseLng = 77.6412;

    const telemetryInterval = setInterval(async () => {
      step += 1;
      const latOffset = (Math.sin(step / 3) * 0.003);
      const lngOffset = (Math.cos(step / 3) * 0.003);

      try {
        await fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId,
            driverId,
            latitude: Number((baseLat + latOffset).toFixed(6)),
            longitude: Number((baseLng + lngOffset).toFixed(6)),
            heading: (step * 25) % 360,
            speed: 32 + (step % 8),
          }),
        });
      } catch (e) {}
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, [telemetryActive, tripId, tripStatus, driverId]);

  // Calculate boarded count
  const boardedCount = passengers.filter((p) => p.status === 'BOARDED').length;
  const totalCount = passengers.length;

  // 3. State Machine Transitions
  const handleTransitionTrip = async (nextStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, actor: `Driver (${driverName})` }),
      });
      const data = await res.json();
      if (res.ok) {
        setTripStatus(nextStatus);
        setRecentNotification(`Trip status updated: ${nextStatus.replace(/_/g, ' ')}`);
        setTimeout(() => setRecentNotification(null), 3500);
        await fetchManifest();
      } else {
        alert(data.error || 'Invalid state transition');
      }
    } catch (e) {
      alert('Network error updating trip status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 4. Handle QR Scan or PIN verification
  const handleScanSuccess = async (scanned: ScannedBoardingData) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: scanned.empId,
          boardingOtp: scanned.pin,
          driverId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecentNotification(`✅ ${scanned.empName} verified and marked as BOARDED!`);
        setTimeout(() => setRecentNotification(null), 4000);
        await fetchManifest();
        if (onPassengerBoarded) {
          onPassengerBoarded(scanned.empId, scanned.pin);
        }
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (e) {
      alert('Error verifying boarding credentials.');
    }
  };

  const handleManualVerify = async () => {
    if (!manualPinModal.passenger || !pinInput) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: manualPinModal.passenger.empCode,
          boardingOtp: pinInput.trim(),
          driverId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecentNotification(`✅ ${manualPinModal.passenger.name} verified and marked as BOARDED!`);
        setTimeout(() => setRecentNotification(null), 4000);
        setManualPinModal({ open: false, passenger: null });
        setPinInput('');
        await fetchManifest();
      } else {
        alert(data.error || 'Invalid PIN');
      }
    } catch (e) {
      alert('Error verifying PIN.');
    }
  };

  const handleMarkNoShow = async () => {
    if (!noShowModal.passenger) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: noShowModal.passenger.empCode,
          reason: noShowReason,
          driverId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecentNotification(`⚠️ ${noShowModal.passenger.name} marked as NO-SHOW.`);
        setTimeout(() => setRecentNotification(null), 4000);
        setNoShowModal({ open: false, passenger: null });
        await fetchManifest();
      } else {
        alert(data.error || 'Failed to mark no-show');
      }
    } catch (e) {
      alert('Error submitting no-show.');
    }
  };

  const handleSOS = async () => {
    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: passengers[0]?.empCode || 'DRV-SOS',
          tripId,
          latitude: 12.9719,
          longitude: 77.6412,
          notes: `Emergency SOS broadcasted by Driver ${driverName} (${vehiclePlate})`,
        }),
      });
      alert('🚨 EMERGENCY SOS BROADCASTED! Atharva Command Center has been alerted.');
      if (onTriggerSOS) onTriggerSOS();
    } catch (e) {
      alert('SOS dispatched.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-100 min-h-screen font-sans">
      
      {/* Top Device Switcher / Helper Toolbar */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between bg-white border border-slate-300 p-2 shadow-sm text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Car className="w-4 h-4 text-emerald-600" />
          <span>Driver Operations Terminal (Live Database Connected)</span>
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
              {vehiclePlate} • {tripStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-2 py-0.5 border border-slate-700">
              TRIP: {tripCode}
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

          {/* TRIP STATE MACHINE CONTROLS */}
          <div className="mt-3 pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-2">
            {tripStatus === 'ASSIGNED' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionTrip('DRIVER_ACCEPTED')}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-2 px-3 text-xs tracking-wide uppercase transition-colors"
              >
                Accept Trip
              </button>
            )}

            {tripStatus === 'DRIVER_ACCEPTED' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionTrip('DRIVER_ARRIVED')}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black py-2 px-3 text-xs tracking-wide uppercase transition-colors"
              >
                Arrived at Pickup Zone
              </button>
            )}

            {tripStatus === 'DRIVER_ARRIVED' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionTrip('TRIP_STARTED')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 px-3 text-xs tracking-wide uppercase transition-colors"
              >
                Start Trip Route
              </button>
            )}

            {tripStatus === 'TRIP_STARTED' && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionTrip('IN_TRANSIT')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2 px-3 text-xs tracking-wide uppercase transition-colors"
              >
                Commence In-Transit
              </button>
            )}

            {['TRIP_STARTED', 'IN_TRANSIT'].includes(tripStatus) && (
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionTrip('TRIP_COMPLETED')}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-black py-2 px-3 text-xs tracking-wide uppercase transition-colors"
              >
                Complete Trip (Office Drop)
              </button>
            )}

            <button
              onClick={handleSOS}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-2 px-3 text-xs flex items-center space-x-1"
              title="Broadcast Emergency SOS"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
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
                Pickup Order & Verification Manifest
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                Auto-Syncing with DB
              </span>
            </div>

            <div className="space-y-2.5">
              {passengers.map((passenger, idx) => (
                <div
                  key={passenger.empCode}
                  className={`p-3 border-2 transition-all ${
                    passenger.status === 'BOARDED'
                      ? 'bg-emerald-50/70 border-emerald-500'
                      : passenger.status === 'NO_SHOW'
                      ? 'bg-red-50/70 border-red-400'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`w-7 h-7 font-black text-xs flex items-center justify-center shadow-sm shrink-0 ${
                          passenger.status === 'BOARDED'
                            ? 'bg-emerald-600 text-white'
                            : passenger.status === 'NO_SHOW'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {passenger.seat}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-sm text-slate-900">{passenger.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500">{passenger.empCode}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 flex items-start space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span>{passenger.pickup}</span>
                        </p>
                        {passenger.noShowReason && (
                          <p className="text-[11px] text-red-700 font-bold mt-1">
                            Reason: {passenger.noShowReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0 text-right">
                      {passenger.status === 'BOARDED' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>BOARDED</span>
                        </span>
                      ) : passenger.status === 'NO_SHOW' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold">
                          <X className="w-3 h-3" />
                          <span>NO SHOW</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black">
                          <Clock className="w-3 h-3" />
                          <span>WAITING</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar for each Passenger */}
                  {passenger.status === 'WAITING' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setManualPinModal({ open: true, passenger });
                            setPinInput('');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center space-x-1"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>Enter PIN</span>
                        </button>

                        <button
                          onClick={() => {
                            setNoShowModal({ open: true, passenger });
                          }}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold"
                        >
                          No Show
                        </button>
                      </div>

                      <a
                        href={`tel:${passenger.phone}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: ROUTE MAP */}
        {activeTab === 'map' && (
          <div className="p-4 space-y-3">
            <div className="h-[360px] border-2 border-slate-900 relative">
              <GoogleMapsTracker
                apiKey="AIzaSyCKgJFq-W4yJ9s7k85RfXd_2J8MkoaJ2BU"
                driverCoords={{ latitude: 12.9719, longitude: 77.6412 }}
                pickupCoords={{ latitude: 12.9719, longitude: 77.6412 }}
                pickupAddress={passengers[0]?.pickup || 'Indiranagar 100ft Road'}
                vehiclePlate={vehiclePlate}
                driverName={driverName}
              />
            </div>
          </div>
        )}
      </div>

      {/* Manual PIN Entry Modal */}
      {manualPinModal.open && manualPinModal.passenger && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-900 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-black text-sm text-slate-900">
                Boarding PIN • {manualPinModal.passenger.name}
              </h4>
              <button
                onClick={() => setManualPinModal({ open: false, passenger: null })}
                className="text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Ask passenger for their 4-digit security PIN displayed on their Employee App:
            </p>
            <input
              type="text"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="e.g. 7492"
              className="w-full text-center font-mono font-black text-2xl tracking-widest p-2 border-2 border-slate-900 focus:outline-none focus:border-blue-600"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setManualPinModal({ open: false, passenger: null })}
                className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleManualVerify}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs"
              >
                Verify & Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Show Confirmation Modal */}
      {noShowModal.open && noShowModal.passenger && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-600 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-red-600 border-b pb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-black text-sm text-slate-900">
                Mark No-Show • {noShowModal.passenger.name}
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              Confirm passenger did not show up. This will immediately alert the Operations Command Desk.
            </p>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Reason</label>
              <select
                value={noShowReason}
                onChange={(e) => setNoShowReason(e.target.value)}
                className="w-full p-2 border border-slate-300 text-xs font-semibold"
              >
                <option value="Passenger not present at pickup location">Passenger not present at pickup location</option>
                <option value="Phone unreachable / no response">Phone unreachable / no response</option>
                <option value="Passenger opted out / took personal vehicle">Passenger opted out / personal vehicle</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setNoShowModal({ open: false, passenger: null })}
                className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkNoShow}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs"
              >
                Confirm No-Show
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
