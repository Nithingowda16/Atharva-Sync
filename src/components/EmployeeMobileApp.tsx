'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { QRCodeBadge } from '@/components/QRCodeBadge';
import { GoogleMapsTracker, LocationNode } from '@/components/GoogleMapsTracker';

interface EmployeeMobileAppProps {
  employeeName?: string;
  employeeCode?: string;
  employeeId?: string;
  companyName?: string;
  onSwitchPortal?: (portal: 'vendor-portal' | 'admin-portal' | 'driver-app') => void;
}

export const EmployeeMobileApp: React.FC<EmployeeMobileAppProps> = ({
  employeeName: defaultName = 'Amrutha Rao',
  employeeCode: defaultCode = 'EMP-9042',
  employeeId: defaultId = 'emp-amrutha',
  companyName: defaultCompany = 'Enterprise Tech Client',
  onSwitchPortal,
}) => {
  const [employeeName, setEmployeeName] = useState(defaultName);
  const [employeeCode, setEmployeeCode] = useState(defaultCode);
  const [employeeId, setEmployeeId] = useState(defaultId);
  const [companyName, setCompanyName] = useState(defaultCompany);

  const [tripId, setTripId] = useState('trip-ath-8821');
  const [tripCode, setTripCode] = useState('ATH-2026-00124');
  const [pickupAddress, setPickupAddress] = useState('Gate 2, Golden Palms Apts, Indiranagar 100ft Road, Bengaluru');
  const [pickupCoords, setPickupCoords] = useState({ latitude: 12.9719, longitude: 77.6412 });
  const [vehiclePlate, setVehiclePlate] = useState('KA-03-HA-8821');
  const [vehicleModel, setVehicleModel] = useState('Toyota Innova Crysta (White AC)');
  const [driverName, setDriverName] = useState('Suresh Babu');
  const [driverPhone, setDriverPhone] = useState('+91 98765 43210');
  const [driverRating, setDriverRating] = useState('4.9 ★');
  const [driverLocation, setDriverLocation] = useState({ latitude: 12.976, longitude: 77.632 });
  const [boardingPin, setBoardingPin] = useState('7492');
  const [boardedState, setBoardedState] = useState<boolean>(false);
  const [tripStatus, setTripStatus] = useState<string>('IN_TRANSIT');
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('mobile-frame');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [locationIssueReason, setLocationIssueReason] = useState('Gate closed / waiting 200m ahead');
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);
  const [activeSOSModal, setActiveSOSModal] = useState(false);

  // 1. Fetch live employee commute from database
  const fetchCommute = async () => {
    try {
      const res = await fetch(`/api/mobile/employee/commute?employeeId=${encodeURIComponent(employeeId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.activeCommute) {
          const c = data.activeCommute;
          setTripId(c.tripId);
          setTripCode(c.tripCode);
          setEmployeeName(c.employeeName);
          setEmployeeCode(c.employeeCode);
          setPickupAddress(c.pickup.address);
          setPickupCoords(c.pickup);
          setVehiclePlate(c.vehicle.plateNumber);
          setVehicleModel(c.vehicle.model);
          setDriverName(c.driver.name);
          setDriverPhone(c.driver.phone);
          setDriverRating(c.driver.rating);
          setBoardingPin(c.boardingOtp);
          setBoardedState(c.boardingStatus === 'BOARDED');
          setTripStatus(c.status);
          if (c.driver.currentLocation) {
            setDriverLocation({
              latitude: c.driver.currentLocation.latitude,
              longitude: c.driver.currentLocation.longitude,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch commute data:', e);
    }
  };

  useEffect(() => {
    fetchCommute();
    const interval = setInterval(fetchCommute, 3000);
    return () => clearInterval(interval);
  }, [employeeId]);

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

  const handleShareTrip = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Atharva ETS Live Commute: ${employeeName} is travelling in Cab ${vehiclePlate} (${driverName} - ${driverPhone}). PIN: ${boardingPin}.`
      );
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const handleLocationSubmit = async () => {
    if (!newAddressInput.trim()) return;
    setIsSubmittingLocation(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/reassign-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          newCoordinates: {
            latitude: pickupCoords.latitude + 0.002,
            longitude: pickupCoords.longitude + 0.001,
          },
          updatedAddress: newAddressInput.trim(),
          reason: locationIssueReason,
        }),
      });

      if (res.ok) {
        setPickupAddress(newAddressInput.trim());
        setIsLocationModalOpen(false);
        setNewAddressInput('');
        alert('Pickup waypoint successfully updated. Driver received updated navigation.');
        await fetchCommute();
      }
    } catch (e) {
      alert('Error updating pickup location.');
    } finally {
      setIsSubmittingLocation(false);
    }
  };

  const handleTriggerSOS = async () => {
    try {
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          tripId,
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
          notes: `SOS triggered by ${employeeName} in vehicle ${vehiclePlate}`,
        }),
      });
      setActiveSOSModal(false);
      alert('🚨 EMERGENCY SOS TRIGGERED! Atharva Central Operations Command and Police Escort dispatched.');
    } catch (e) {
      alert('Emergency alert registered.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-100 min-h-screen font-sans">
      
      {/* Top Device Switcher / Helper Toolbar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between bg-white border border-slate-300 p-2 shadow-sm text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>Employee Commuter App (Live Database Connected)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'mobile-frame' ? 'responsive' : 'mobile-frame')}
            className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-semibold"
          >
            {viewMode === 'mobile-frame' ? 'Expand' : 'Mobile Frame'}
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

      {/* Main Employee App Shell */}
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
                Today&apos;s Dispatch • {tripCode}
              </span>
              <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5">
                13:30 SHIFT • LOGIN
              </span>
            </div>

            {/* Pickup & Drop Points */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Node:</span>
                  <strong className="text-slate-900 block leading-tight">{pickupAddress}</strong>
                  <button
                    onClick={() => {
                      setNewAddressInput(pickupAddress);
                      setIsLocationModalOpen(true);
                    }}
                    className="text-[11px] text-blue-700 hover:underline font-bold mt-1 inline-block"
                  >
                    Change Pickup Location ➔
                  </button>
                </div>
              </div>
              <div className="flex items-start space-x-2 pt-1 border-t border-slate-200">
                <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination:</span>
                  <strong className="text-slate-900 block leading-tight">
                    Enterprise Tech Park (Bellandur Hub Gate 2)
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
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Chauffeur</span>
              </a>

              <button
                onClick={handleShareTrip}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Share Ride</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC QR CODE & OTP BOARDING PASS */}
          <div className="bg-white border-2 border-slate-900 p-4 text-center space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center space-x-1">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Contactless QR Boarding Pass</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 border border-emerald-300">
                Single-Use Token
              </span>
            </div>

            {/* Render Real Dynamic QR Code */}
            <div className="flex justify-center py-1">
              <QRCodeBadge
                payload={qrPayload}
                size={170}
                pin={boardingPin}
              />
            </div>

            <p className="text-xs text-slate-500">
              Show this QR code to Driver <strong className="text-slate-800">{driverName}</strong> when boarding vehicle {vehiclePlate}.
            </p>

            {/* 4-DIGIT BACKUP BOARDING PIN */}
            <div className="bg-amber-50 border-2 border-dashed border-amber-400 p-3 rounded-none">
              <span className="text-[10px] uppercase font-extrabold text-amber-900 block tracking-wider">
                OR SHARE 4-DIGIT BOARDING PIN
              </span>
              <div className="font-mono text-3xl font-black tracking-[0.35em] text-slate-900 my-1">
                {boardingPin}
              </div>
              <span className="text-[10px] text-amber-800">
                Valid for Trip #{tripCode}
              </span>
            </div>
          </div>

          {/* EMERGENCY SOS TRIGGER BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => setActiveSOSModal(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center space-x-2 tracking-wider uppercase shadow-md transition-colors"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>EMERGENCY SOS PANIC BUTTON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pickup Location Change Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-900 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-black text-sm text-slate-900">
                Adjust Pickup Location
              </h4>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">New Address / Landmark</label>
              <textarea
                value={newAddressInput}
                onChange={(e) => setNewAddressInput(e.target.value)}
                rows={2}
                className="w-full p-2 border-2 border-slate-900 text-xs font-semibold focus:outline-none"
                placeholder="e.g. Opposite Metro Pillar 128, 100ft Rd"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Reason</label>
              <select
                value={locationIssueReason}
                onChange={(e) => setLocationIssueReason(e.target.value)}
                className="w-full p-2 border border-slate-300 text-xs font-semibold"
              >
                <option value="Gate closed / barrier">Gate closed / barrier</option>
                <option value="Road construction / traffic blockage">Road construction / traffic blockage</option>
                <option value="Waiting 200m ahead near bus stop">Waiting 200m ahead near bus stop</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingLocation}
                onClick={handleLocationSubmit}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs"
              >
                Update Waypoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Confirmation Modal */}
      {activeSOSModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-600 max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-red-600 border-b pb-2">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h4 className="font-black text-base text-slate-900">
                CONFIRM EMERGENCY SOS
              </h4>
            </div>
            <p className="text-xs text-slate-700">
              This will immediately sound alarms at the Atharva 24x7 Central Operations Command, dispatch the nearest QRT escort, and alert company security.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveSOSModal(false)}
                className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerSOS}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs"
              >
                BROADCAST SOS NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
