'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Car, Layers, AlertCircle, Key, RefreshCw } from 'lucide-react';

interface GoogleMapsTrackerProps {
  apiKey?: string;
  pickupCoords: { latitude: number; longitude: number };
  pickupAddress: string;
  driverCoords?: { latitude: number; longitude: number };
  vehiclePlate?: string;
  driverName?: string;
  onPickupReassigned?: (newCoords: { latitude: number; longitude: number }, address: string) => void;
  interactive?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
  }
}

export const GoogleMapsTracker: React.FC<GoogleMapsTrackerProps> = ({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCKgJFq-W4yJ9s7k85RfXd_2J8MkoaJ2BU',
  pickupCoords,
  pickupAddress,
  driverCoords = { latitude: 12.9760, longitude: 77.6320 },
  vehiclePlate = 'KA-03-HA-8821',
  driverName = 'Suresh Babu',
  onPickupReassigned,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string>(
    apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCKgJFq-W4yJ9s7k85RfXd_2J8MkoaJ2BU'
  );
  const [inputKey, setInputKey] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const mapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  // Destination Office Campus (Bengaluru Tech Park, Bellandur / Outer Ring Rd)
  const campusCoords = { lat: 12.9352, lng: 77.6946 };

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (!activeKey) return;

    // Handle Google Maps authentication failures gracefully
    if (typeof window !== 'undefined') {
      window.gm_authFailure = () => {
        console.warn('Google Maps API key authentication error.');
        setMapError('Google Maps API key warning: check Google Cloud Console referrer settings or billing.');
      };
    }

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${activeKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
      };
      script.onerror = () => {
        setMapError('Failed to load Google Maps SDK. Please check your API key & domain whitelist.');
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [activeKey]);

  // Initialize Map
  const initMap = () => {
    if (!mapContainerRef.current || !window.google || !window.google.maps) return;

    try {
      const center = { lat: pickupCoords.latitude, lng: pickupCoords.longitude };

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 13,
        mapTypeId: mapType,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        mapTypeControl: false,
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        ],
      });

      mapInstanceRef.current = map;

      // Traffic Layer
      const traffic = new window.google.maps.TrafficLayer();
      trafficLayerRef.current = traffic;
      if (showTraffic) {
        traffic.setMap(map);
      }

      // Directions Renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 5,
          strokeOpacity: 0.85,
        },
      });
      directionsRendererRef.current = directionsRenderer;

      // Pickup Marker (Green House) - Draggable for Location Reassignment
      const pickupMarker = new window.google.maps.Marker({
        position: { lat: pickupCoords.latitude, lng: pickupCoords.longitude },
        map,
        title: `Pickup: ${pickupAddress}`,
        draggable: interactive,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#16a34a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });
      pickupMarkerRef.current = pickupMarker;

      // Handle Dragging Marker to Reassign Location
      if (interactive && onPickupReassigned) {
        pickupMarker.addListener('dragend', (e: any) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
            const address = results && results[0] ? results[0].formatted_address : `Custom GPS (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`;
            onPickupReassigned({ latitude: newLat, longitude: newLng }, address);
          });
        });
      }

      // Campus Marker (Red Building)
      new window.google.maps.Marker({
        position: campusCoords,
        map,
        title: 'Nexus Tech Park (Tower B)',
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#dc2626',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Driver Vehicle Marker (Blue Moving Car)
      const driverMarker = new window.google.maps.Marker({
        position: { lat: driverCoords.latitude, lng: driverCoords.longitude },
        map,
        title: `Atharva Cab: ${vehiclePlate} (${driverName})`,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          rotation: 45,
          fillColor: '#1e40af',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      driverMarkerRef.current = driverMarker;

      // Calculate Real Route Geometry via Google Maps DirectionsService
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: driverCoords.latitude, lng: driverCoords.longitude },
          destination: campusCoords,
          waypoints: [
            {
              location: { lat: pickupCoords.latitude, lng: pickupCoords.longitude },
              stopover: true,
            },
          ],
          travelMode: window.google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'bestguess',
          },
        },
        (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            console.warn('Directions request failed due to: ' + status);
          }
        }
      );

      setMapLoaded(true);
      setMapError(null);
    } catch (err: any) {
      console.error('Google Maps init error:', err);
      setMapError(err.message || 'Error initializing Google Maps');
    }
  };

  // Toggle Traffic Layer
  const toggleTraffic = () => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;
    if (showTraffic) {
      trafficLayerRef.current.setMap(null);
      setShowTraffic(false);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      setShowTraffic(true);
    }
  };

  // Toggle Map Type (Roadmap / Satellite)
  const changeMapType = (type: 'roadmap' | 'satellite' | 'terrain') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  // Update Driver Marker Position when new telemetry arrives
  useEffect(() => {
    if (driverMarkerRef.current && window.google) {
      const newPos = new window.google.maps.LatLng(driverCoords.latitude, driverCoords.longitude);
      driverMarkerRef.current.setPosition(newPos);
    }
  }, [driverCoords]);

  // Update Pickup Marker Position when reassigned
  useEffect(() => {
    if (pickupMarkerRef.current && window.google) {
      const newPos = new window.google.maps.LatLng(pickupCoords.latitude, pickupCoords.longitude);
      pickupMarkerRef.current.setPosition(newPos);
    }
  }, [pickupCoords]);

  return (
    <div className="relative w-full h-[520px] rounded-none overflow-hidden border border-slate-200 shadow-md bg-slate-100 flex flex-col">
      
      {/* Top Google Maps Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-none border border-slate-200 shadow-lg text-xs">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-none flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block leading-tight">
              Google Maps Live Telemetry
            </span>
            <span className="text-[11px] text-slate-500">
              Vehicle: <strong>{vehiclePlate}</strong> • Driver: {driverName}
            </span>
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTraffic}
            className={`px-3 py-1.5 rounded-none font-bold border transition-all ${
              showTraffic
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            🚦 {showTraffic ? 'Traffic ON' : 'Traffic OFF'}
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-none border border-slate-200">
            <button
              onClick={() => changeMapType('roadmap')}
              className={`px-2.5 py-1 rounded-none font-semibold ${
                mapType === 'roadmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => changeMapType('satellite')}
              className={`px-2.5 py-1 rounded-none font-semibold ${
                mapType === 'satellite' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Main Google Maps Viewport */}
      {activeKey ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* Prompt to Configure Google Maps API Key */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-none flex items-center justify-center mb-4 shadow-sm">
            <Navigation className="w-8 h-8" />
          </div>
          
          <h3 className="text-lg font-black text-slate-800">
            Activate Genuine Google Maps Live Tracking
          </h3>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-5 leading-relaxed">
            To render genuine Google Maps with live Bengaluru traffic, Directions routing, and vehicle satellite views, enter your Google Maps JavaScript API key below or set <code className="bg-slate-200 px-1 py-0.5 rounded-none text-slate-800">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
          </p>

          <div className="max-w-md w-full bg-white p-4 rounded-none border border-slate-300 shadow-sm space-y-3 text-left">
            <label className="block text-xs font-bold text-slate-700">
              Google Maps API Key:
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-none focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
              <button
                onClick={() => {
                  if (inputKey.trim()) {
                    setActiveKey(inputKey.trim());
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-none text-xs transition-colors shrink-0 flex items-center space-x-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Connect Key</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Enable Maps JavaScript API & Directions API in your Google Cloud Console.
            </span>
          </div>

          {/* Real Google Maps Official Embed Fallback */}
          <div className="mt-6 w-full max-w-xl h-48 rounded-none overflow-hidden border border-slate-200 shadow-sm relative">
            <div className="absolute top-2 left-2 z-10 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-none backdrop-blur-sm">
              Live Google Maps Embed Preview
            </div>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/directions?key=${activeKey || 'DEMO_KEY'}&origin=12.9760,77.6320&destination=12.9352,77.6946&waypoints=12.9719,77.6412`}
              onError={() => console.log('Embed fallback')}
            />
          </div>
        </div>
      )}

      {/* Bottom Floating Legend / Reassignment Tip */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-none text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-500 inline-block" />
            <span>Pickup: <strong>Indiranagar</strong> (Drag marker to reassign)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-none bg-blue-500 inline-block" />
            <span>Atharva Cab: <strong>KA-03-HA-8821</strong></span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-none bg-red-500 inline-block" />
            <span>Destination: <strong>Campus Hub</strong></span>
          </span>
        </div>
        <span className="text-[10px] text-amber-300 font-bold">
          💡 Drag the green marker on Google Maps to update employee pickup point live!
        </span>
      </div>
    </div>
  );
};

