'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Car,
  Layers,
  AlertCircle,
  RefreshCw,
  Compass,
  Clock,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';

export interface LocationNode {
  id?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  passengerName?: string;
  passengerRole?: string;
  boardingOtp?: string;
  stopLetter?: 'A' | 'B' | 'C' | 'D';
  boardingStatus?: 'BOARDED' | 'WAITING' | 'NEXT_PICKUP' | 'COMPLETED';
}

export interface GoogleMapsTrackerProps {
  apiKey?: string;
  pickupCoords?: { latitude: number; longitude: number };
  pickupAddress?: string;
  driverCoords?: { latitude: number; longitude: number };
  vehiclePlate?: string;
  driverName?: string;
  onPickupReassigned?: (newCoords: { latitude: number; longitude: number }, address: string) => void;
  interactive?: boolean;
  locationA?: LocationNode;
  locationB?: LocationNode;
  title?: string;
  showMultiStopSimulation?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
    L?: any;
  }
}

// ----------------------------------------------------------------------------
// Bengaluru Central Reference Coordinates
// ----------------------------------------------------------------------------
const DEFAULT_BENGALURU_LAT = 12.9716;
const DEFAULT_BENGALURU_LNG = 77.5946;

export const GoogleMapsTracker: React.FC<GoogleMapsTrackerProps> = ({
  pickupCoords,
  pickupAddress,
  driverCoords,
  vehiclePlate = 'KA-03-HA-8821',
  driverName = 'Suresh Babu',
  onPickupReassigned,
  interactive = true,
  title,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const effectiveDriverLat = driverCoords?.latitude || DEFAULT_BENGALURU_LAT;
  const effectiveDriverLng = driverCoords?.longitude || DEFAULT_BENGALURU_LNG;

  const effectivePickupLat = pickupCoords?.latitude || 12.9719;
  const effectivePickupLng = pickupCoords?.longitude || 77.6412;

  return (
    <div className="w-full border border-slate-200 bg-white shadow-sm flex flex-col font-sans overflow-hidden">
      {/* 1. CLEAN TELEMETRY HEADER */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                {title || `Live Fleet Radar: ${vehiclePlate}`}
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 border border-emerald-400/30 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>GPS LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chauffeur: <strong>{driverName}</strong> • {pickupAddress ? `Pickup: ${pickupAddress}` : 'Bengaluru Central Transit Corridor'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center border border-slate-700 bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                mapType === 'roadmap' ? 'bg-[#0f5fc2] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                mapType === 'satellite' ? 'bg-[#0f5fc2] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center border border-slate-700"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 10))}
            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center border border-slate-700"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME INTERACTIVE RADAR CANVAS */}
      <div className="relative w-full h-[380px] bg-slate-100 overflow-hidden">
        {/* OpenStreetMap Tile Layer Canvas */}
        <iframe
          title="Live GPS Fleet Radar"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${effectiveDriverLng - 0.035}%2C${effectiveDriverLat - 0.025}%2C${effectiveDriverLng + 0.035}%2C${effectiveDriverLat + 0.025}&layer=mapnik&marker=${effectiveDriverLat}%2C${effectiveDriverLng}`}
          className="w-full h-full filter saturate-125"
        />

        {/* Floating Active Cab & Pickup Waypoint Card */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-300 p-3 shadow-lg max-w-sm z-10 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>{vehiclePlate}</span>
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5">
              Driver: {driverName}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Passenger Pickup</span>
                <span className="text-slate-800 font-medium">
                  {pickupAddress || 'Indiranagar 100ft Road / Domlur Corridor'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <span>Telemetry: <strong>34 km/h</strong></span>
              <span className="text-emerald-700 font-bold">On-Time ETA: 6m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
