'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  Scan,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Zap,
  Volume2,
  RefreshCw,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export interface ScannedBoardingData {
  type: string;
  empId: string;
  empName: string;
  tripId: string;
  pin: string;
  seat?: string;
  pickupPoint?: string;
  verifiedAt: string;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ScannedBoardingData) => void;
  expectedTripId?: string;
  pendingPassengers?: {
    empCode: string;
    name: string;
    pin: string;
    seat?: string;
    pickup: string;
  }[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  expectedTripId = 'TRP-9021',
  pendingPassengers = [
    { empCode: 'EMP-8492', name: 'Harish R.', pin: '8492', seat: '1A', pickup: 'Indiranagar Metro' },
    { empCode: 'EMP-8493', name: 'Bhaskar N.', pin: '5120', seat: '1B', pickup: 'Koramangala 4th Block' },
    { empCode: 'EMP-8494', name: 'Hemaraj K.', pin: '3914', seat: '2A', pickup: 'HSR Layout Sector 1' },
  ],
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'pin'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScannedBoardingData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play Boarding Verification Chime via Web Audio API
  const playVerificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Dual tone pleasant success chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // D6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not accessible in this browser context. Please use Quick Scan or PIN entry.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera permission was not granted or no webcam found. Use Quick Scan Demo or Manual PIN below.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Execute Successful Boarding
  const handleBoardingComplete = (passenger: typeof pendingPassengers[0]) => {
    playVerificationChime();
    const verified: ScannedBoardingData = {
      type: 'BOARDING_PASS',
      empId: passenger.empCode,
      empName: passenger.name,
      tripId: expectedTripId,
      pin: passenger.pin,
      seat: passenger.seat || '1A',
      pickupPoint: passenger.pickup,
      verifiedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setScanResult(verified);
    setErrorMessage(null);

    // Push verification to parent after brief visual celebration
    setTimeout(() => {
      onScanSuccess(verified);
      onClose();
      setScanResult(null);
    }, 1600);
  };

  // Handle Manual PIN Submission
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const passenger = pendingPassengers.find((p) => p.pin === pinInput.trim());
    if (passenger) {
      handleBoardingComplete(passenger);
      setPinInput('');
    } else {
      setErrorMessage(`Invalid PIN "${pinInput}". Please verify with passenger.`);
    }
  };

  // Fast Instant Scan Button (Demo / Hassle-Free One-Tap)
  const handleInstantDemoScan = (passengerIndex = 0) => {
    const passenger = pendingPassengers[passengerIndex] || pendingPassengers[0];
    if (passenger) {
      handleBoardingComplete(passenger);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full border-2 border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 text-white flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wide">
                Driver Boarding Scanner
              </h3>
              <p className="text-[10px] text-slate-400">
                Contactless QR Verification • Trip: {expectedTripId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2.5 px-4 flex items-center justify-center space-x-2 border-r border-slate-200 transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-blue-700 border-b-2 border-b-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            className={`py-2.5 px-4 flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'pin'
                ? 'bg-white text-blue-700 border-b-2 border-b-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Manual 4-Digit PIN</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4">
          
          {/* SUCCESS BANNER */}
          {scanResult && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 space-y-2 text-center animate-fade-in">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center shadow-md animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-black text-base text-emerald-800">
                PASSENGER BOARDED SUCCESSFULLY!
              </h4>
              <div className="text-xs space-y-0.5 text-emerald-700">
                <p className="font-bold text-sm text-slate-900">{scanResult.empName} ({scanResult.empId})</p>
                <p>Assigned Seat: <strong>{scanResult.seat}</strong> • Pickup: {scanResult.pickupPoint}</p>
                <p className="text-[10px] text-emerald-600 font-mono">Timestamp: {scanResult.verifiedAt}</p>
              </div>
            </div>
          )}

          {/* TAB 1: CAMERA SCANNER */}
          {!scanResult && activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Camera Viewport or Simulation Box */}
              <div className="relative w-full h-64 bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center text-slate-400 space-y-2">
                    <Scan className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">
                      {cameraError || 'Position Employee Boarding Pass QR Code inside viewfinder'}
                    </p>
                  </div>
                )}

                {/* Futuristic QR Targeting Reticle & Laser */}
                <div className="absolute inset-8 border-2 border-emerald-400/70 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between p-1">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  {/* Moving Laser Beam */}
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  <div className="flex justify-between p-1">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 text-[10px] text-center font-mono">
                  ALIGN QR CODE WITH RETICLE
                </div>
              </div>

              {/* Quick 1-Tap Passenger Scan Demo Buttons (Zero-Friction Testing) */}
              <div className="bg-slate-50 border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant Boarding Scan (1-Tap):</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {pendingPassengers.length} Awaiting Pickup
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {pendingPassengers.map((passenger, idx) => (
                    <button
                      key={passenger.empCode}
                      onClick={() => handleInstantDemoScan(idx)}
                      className="w-full text-left p-2 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-800 font-black text-[10px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {passenger.seat || `${idx + 1}`}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-800">
                            {passenger.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {passenger.pickup} • PIN: <strong className="font-mono text-slate-700">{passenger.pin}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        Scan & Board ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL 4-DIGIT PIN ENTRY */}
          {!scanResult && activeTab === 'pin' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-800">
                  Enter Passenger 4-Digit Boarding PIN
                </h4>
                <p className="text-xs text-slate-500">
                  Ask commuter for the 4-digit PIN shown on their Employee App
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="8 4 9 2"
                    className="w-48 text-center text-3xl font-mono font-black tracking-widest py-2.5 px-3 border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === 'C') {
                          setPinInput('');
                        } else if (key === '✓') {
                          handlePinSubmit();
                        } else {
                          if (pinInput.length < 4) {
                            setPinInput(pinInput + key);
                          }
                        }
                      }}
                      className={`py-2 text-sm font-bold border transition-colors ${
                        key === '✓'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700'
                          : key === 'C'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors"
                >
                  Verify Boarding PIN
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Atharva ETS v2.4 Driver Scanner</span>
          <span className="flex items-center space-x-1 text-emerald-600 font-bold">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio Chime Enabled</span>
          </span>
        </div>

      </div>
    </div>
  );
};
