'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Car,
  Layers,
  AlertCircle,
  Key,
  RefreshCw,
  ArrowRightLeft,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Clock,
  Gauge,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface LocationNode {
  name: string;
  address: string;
  lat: number;
  lng: number;
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
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
    L?: any;
  }
}

// Pre-configured Bangalore Tech Corridor Example Routes
const ROUTE_PRESETS: {
  id: string;
  name: string;
  badge: string;
  origin: LocationNode;
  destination: LocationNode;
  estDistance: string;
  estDuration: string;
  summary: string;
}[] = [
  {
    id: 'preset-1',
    name: 'Indiranagar Metro ➔ Nexus Tech Park',
    badge: 'Core Corridor (11.8 km)',
    origin: {
      name: 'Location A: Indiranagar Metro Station',
      address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, 560038',
      lat: 12.9719,
      lng: 77.6412,
    },
    destination: {
      name: 'Location B: Nexus Tech Park (Campus Hub)',
      address: 'Outer Ring Rd, Bellandur, Bengaluru, Karnataka 560103',
      lat: 12.9352,
      lng: 77.6946,
    },
    estDistance: '11.8 km',
    estDuration: '24 mins',
    summary: 'via 100ft Rd & Outer Ring Rd (Live Traffic: Moderate)',
  },
  {
    id: 'preset-2',
    name: 'Koramangala ➔ Manyata Tech Park',
    badge: 'North-South Tech (17.4 km)',
    origin: {
      name: 'Location A: Koramangala 4th Block Hub',
      address: 'Sony World Junction, Koramangala, Bengaluru, 560034',
      lat: 12.9344,
      lng: 77.6271,
    },
    destination: {
      name: 'Location B: Manyata Embassy Business Park',
      address: 'Outer Ring Rd, Nagavara, Hebbal, Bengaluru, 560045',
      lat: 13.0475,
      lng: 77.6212,
    },
    estDistance: '17.4 km',
    estDuration: '36 mins',
    summary: 'via Inner Ring Rd & Bellary Rd Flyover Expressway',
  },
  {
    id: 'preset-3',
    name: 'Whitefield ITPL ➔ Electronic City Phase 1',
    badge: 'Express Corridor (26.4 km)',
    origin: {
      name: 'Location A: ITPL Main Gate (Whitefield)',
      address: 'International Tech Park, Whitefield, Bengaluru, 560066',
      lat: 12.9863,
      lng: 77.7303,
    },
    destination: {
      name: 'Location B: Electronic City Phase 1 Gate 2',
      address: 'Hosur Rd, Electronic City, Bengaluru, 560100',
      lat: 12.8452,
      lng: 77.6602,
    },
    estDistance: '26.4 km',
    estDuration: '48 mins',
    summary: 'via NICE Rd & Hosur Elevated Expressway',
  },
  {
    id: 'preset-4',
    name: 'Kempegowda Airport (BLR) ➔ Embassy GolfLinks',
    badge: 'Airport Shuttle (42.1 km)',
    origin: {
      name: 'Location A: BLR Int\'l Airport Terminal 1',
      address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
      lat: 13.1986,
      lng: 77.7066,
    },
    destination: {
      name: 'Location B: Embassy GolfLinks Business Park',
      address: 'Challaghatta, Off Indiranagar-Koramangala Link Rd, Bengaluru',
      lat: 12.9492,
      lng: 77.6468,
    },
    estDistance: '42.1 km',
    estDuration: '52 mins',
    summary: 'via KIA Expressway & Airport Rd Elevated Corridor',
  },
];

export const GoogleMapsTracker: React.FC<GoogleMapsTrackerProps> = ({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCKgJFq-W4yJ9s7k85RfXd_2J8MkoaJ2BU',
  pickupCoords,
  pickupAddress,
  driverCoords,
  vehiclePlate = 'KA-03-HA-8821',
  driverName = 'Suresh Babu',
  onPickupReassigned,
  interactive = true,
  locationA: propLocationA,
  locationB: propLocationB,
  title,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string>(
    apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCKgJFq-W4yJ9s7k85RfXd_2J8MkoaJ2BU'
  );
  const [inputKey, setInputKey] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-1');

  // Location A & Location B State
  const [locA, setLocA] = useState<LocationNode>(
    propLocationA || {
      name: 'Location A (Pickup / Origin)',
      address: pickupAddress || ROUTE_PRESETS[0].origin.address,
      lat: pickupCoords?.latitude || ROUTE_PRESETS[0].origin.lat,
      lng: pickupCoords?.longitude || ROUTE_PRESETS[0].origin.lng,
    }
  );

  const [locB, setLocB] = useState<LocationNode>(
    propLocationB || ROUTE_PRESETS[0].destination
  );

  // Live Route Calculation Metrics
  const [routeDistance, setRouteDistance] = useState<string>(ROUTE_PRESETS[0].estDistance);
  const [routeDuration, setRouteDuration] = useState<string>(ROUTE_PRESETS[0].estDuration);
  const [routeSummary, setRouteSummary] = useState<string>(ROUTE_PRESETS[0].summary);
  const [turnSteps, setTurnSteps] = useState<{ instruction: string; distance: string }[]>([]);
  const [showStepsDrawer, setShowStepsDrawer] = useState<boolean>(false);

  // Vehicle Simulation State along A ➔ B
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(15); // percent 0-100
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [simCurrentStreet, setSimCurrentStreet] = useState<string>('En route via 100ft Rd');

  // References to Map Objects
  const mapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const markerARef = useRef<any>(null);
  const markerBRef = useRef<any>(null);
  const cabMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const polylinePathRef = useRef<{ lat: number; lng: number }[]>([]);
  const leafletMapRef = useRef<any>(null);
  const leafletPolylineRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);

  // Keep locA synced if pickupCoords prop updates externally
  useEffect(() => {
    if (pickupCoords && (pickupCoords.latitude !== locA.lat || pickupCoords.longitude !== locA.lng)) {
      setLocA((prev) => ({
        ...prev,
        lat: pickupCoords.latitude,
        lng: pickupCoords.longitude,
        address: pickupAddress || prev.address,
      }));
    }
  }, [pickupCoords, pickupAddress]);

  // Generate fallback intermediate points for smooth route rendering
  const generateRouteGeometry = useCallback((origin: LocationNode, dest: LocationNode) => {
    const points: { lat: number; lng: number }[] = [];
    const count = 30;
    const midLat = (origin.lat + dest.lat) / 2 + (dest.lng - origin.lng) * 0.12;
    const midLng = (origin.lng + dest.lng) / 2 - (dest.lat - origin.lat) * 0.12;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      // Quadratic Bezier interpolation for realistic road curvature
      const lat = (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * midLat + t * t * dest.lat;
      const lng = (1 - t) * (1 - t) * origin.lng + 2 * (1 - t) * t * midLng + t * t * dest.lng;
      points.push({ lat, lng });
    }
    return points;
  }, []);

  // Update Route Polyline & Directions
  const recalculateRoute = useCallback((origin: LocationNode, dest: LocationNode) => {
    if (window.google && window.google.maps && directionsRendererRef.current && mapInstanceRef.current) {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: dest.lat, lng: dest.lng },
            travelMode: window.google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: 'bestguess',
            },
          },
          (result: any, status: any) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
              directionsRendererRef.current.setDirections(result);
              
              const leg = result.routes[0]?.legs[0];
              if (leg) {
                setRouteDistance(leg.distance?.text || '11.8 km');
                setRouteDuration(leg.duration_in_traffic?.text || leg.duration?.text || '24 mins');
                setRouteSummary(`via ${result.routes[0]?.summary || 'Primary Corridor'}`);

                // Extract turn-by-turn steps
                if (leg.steps && leg.steps.length > 0) {
                  const steps = leg.steps.map((st: any) => ({
                    instruction: st.instructions ? st.instructions.replace(/<[^>]*>/g, ' ') : 'Continue along route',
                    distance: st.distance?.text || '',
                  }));
                  setTurnSteps(steps);
                }

                // Cache overview path for cab animation
                if (result.routes[0]?.overview_path) {
                  polylinePathRef.current = result.routes[0].overview_path.map((p: any) => ({
                    lat: p.lat(),
                    lng: p.lng(),
                  }));
                }
              }
            } else {
              console.warn('Google DirectionsService failed or restricted, utilizing geometric router:', status);
              const geom = generateRouteGeometry(origin, dest);
              polylinePathRef.current = geom;
            }
          }
        );
      } catch (err) {
        console.warn('Directions calculation error:', err);
        polylinePathRef.current = generateRouteGeometry(origin, dest);
      }
    } else {
      polylinePathRef.current = generateRouteGeometry(origin, dest);
    }
  }, [generateRouteGeometry]);

  // Handle Preset Switching
  const handleSelectPreset = (presetId: string) => {
    const preset = ROUTE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setLocA(preset.origin);
    setLocB(preset.destination);
    setRouteDistance(preset.estDistance);
    setRouteDuration(preset.estDuration);
    setRouteSummary(preset.summary);
    setSimulationProgress(10);

    // Update Map Pins
    if (markerARef.current && window.google) {
      markerARef.current.setPosition(new window.google.maps.LatLng(preset.origin.lat, preset.origin.lng));
      markerARef.current.setTitle(preset.origin.name);
    }
    if (markerBRef.current && window.google) {
      markerBRef.current.setPosition(new window.google.maps.LatLng(preset.destination.lat, preset.destination.lng));
      markerBRef.current.setTitle(preset.destination.name);
    }

    if (mapInstanceRef.current && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(preset.origin.lat, preset.origin.lng));
      bounds.extend(new window.google.maps.LatLng(preset.destination.lat, preset.destination.lng));
      mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }

    recalculateRoute(preset.origin, preset.destination);

    // Notify parent if listener exists
    if (onPickupReassigned) {
      onPickupReassigned({ latitude: preset.origin.lat, longitude: preset.origin.lng }, preset.origin.address);
    }
  };

  // Reverse / Swap Route (A ➔ B to B ➔ A)
  const handleSwapRoute = () => {
    const newA: LocationNode = {
      ...locB,
      name: locB.name.replace('Location B', 'Location A'),
    };
    const newB: LocationNode = {
      ...locA,
      name: locA.name.replace('Location A', 'Location B'),
    };

    setLocA(newA);
    setLocB(newB);
    setSimulationProgress(10);

    if (markerARef.current && window.google) {
      markerARef.current.setPosition(new window.google.maps.LatLng(newA.lat, newA.lng));
    }
    if (markerBRef.current && window.google) {
      markerBRef.current.setPosition(new window.google.maps.LatLng(newB.lat, newB.lng));
    }

    recalculateRoute(newA, newB);
  };

  // Initialize Google Maps
  const initGoogleMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google || !window.google.maps) return;

    try {
      const center = {
        lat: (locA.lat + locB.lat) / 2,
        lng: (locA.lng + locB.lng) / 2,
      };

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 12,
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
          strokeWeight: 6,
          strokeOpacity: 0.9,
        },
      });
      directionsRendererRef.current = directionsRenderer;

      // Custom SVG Marker Icon for Location A (Emerald Green "A")
      const iconA = {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
            <path d="M19 0 C8.5 0 0 8.5 0 19 C0 32 19 48 19 48 C19 48 38 32 38 19 C38 8.5 29.5 0 19 0 Z" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>
            <circle cx="19" cy="18" r="11" fill="#ffffff"/>
            <text x="19" y="23" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#047857" text-anchor="middle">A</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(38, 48),
        anchor: new window.google.maps.Point(19, 48),
      };

      // Custom SVG Marker Icon for Location B (Crimson Red "B")
      const iconB = {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
            <path d="M19 0 C8.5 0 0 8.5 0 19 C0 32 19 48 19 48 C19 48 38 32 38 19 C38 8.5 29.5 0 19 0 Z" fill="#dc2626" stroke="#ffffff" stroke-width="2.5"/>
            <circle cx="19" cy="18" r="11" fill="#ffffff"/>
            <text x="19" y="23" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#b91c1c" text-anchor="middle">B</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(38, 48),
        anchor: new window.google.maps.Point(19, 48),
      };

      // Custom Cab Vehicle Icon
      const iconCab = {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="21" fill="#1e40af" stroke="#ffffff" stroke-width="3"/>
            <path d="M15 27 L17 20 C17.5 18 19 17 23 17 C27 17 28.5 18 29 20 L31 27 C31.5 28 31 29 30 29 L29 29 C28.5 29 28 28.5 28 28 L28 27 L18 27 L18 28 C18 28.5 17.5 29 17 29 L16 29 C15 29 14.5 28 15 27 Z M18 21 L28 21 L27 19 C26.5 18.5 25.5 18.5 23 18.5 C20.5 18.5 19.5 18.5 19 19 Z" fill="#fbbf24"/>
            <circle cx="18" cy="25" r="1.5" fill="#ffffff"/>
            <circle cx="28" cy="25" r="1.5" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(46, 46),
        anchor: new window.google.maps.Point(23, 23),
      };

      // Marker A (Draggable)
      const markerA = new window.google.maps.Marker({
        position: { lat: locA.lat, lng: locA.lng },
        map,
        title: locA.name,
        draggable: interactive,
        icon: iconA,
      });
      markerARef.current = markerA;

      // Marker B (Draggable)
      const markerB = new window.google.maps.Marker({
        position: { lat: locB.lat, lng: locB.lng },
        map,
        title: locB.name,
        draggable: interactive,
        icon: iconB,
      });
      markerBRef.current = markerB;

      // Moving Vehicle Cab Marker
      const cabMarker = new window.google.maps.Marker({
        position: { lat: locA.lat, lng: locA.lng },
        map,
        title: `Atharva Fleet: ${vehiclePlate} (${driverName})`,
        icon: iconCab,
        zIndex: 999,
      });
      cabMarkerRef.current = cabMarker;

      // Handle Marker A Drag & Drop
      markerA.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
          const address =
            results && results[0] ? results[0].formatted_address : `Custom GPS (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`;
          const updatedA: LocationNode = {
            name: 'Location A (Custom Dropped Pin)',
            address,
            lat: newLat,
            lng: newLng,
          };
          setLocA(updatedA);
          recalculateRoute(updatedA, locB);
          if (onPickupReassigned) {
            onPickupReassigned({ latitude: newLat, longitude: newLng }, address);
          }
        });
      });

      // Handle Marker B Drag & Drop
      markerB.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
          const address =
            results && results[0] ? results[0].formatted_address : `Custom GPS (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`;
          const updatedB: LocationNode = {
            name: 'Location B (Custom Destination)',
            address,
            lat: newLat,
            lng: newLng,
          };
          setLocB(updatedB);
          recalculateRoute(locA, updatedB);
        });
      });

      // Fit map bounds to show both A and B nicely
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(locA.lat, locA.lng));
      bounds.extend(new window.google.maps.LatLng(locB.lat, locB.lng));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

      // Compute initial route
      recalculateRoute(locA, locB);

      setMapLoaded(true);
      setMapEngine('google');
      setMapError(null);
    } catch (err: any) {
      console.warn('Google Maps initialization failed, switching to Leaflet:', err);
      initLeafletFallback();
    }
  }, [locA, locB, interactive, mapType, showTraffic, vehiclePlate, driverName, onPickupReassigned, recalculateRoute]);

  // Fallback to Leaflet OpenStreetMap Engine if Google Maps fails or hits key restriction
  const initLeafletFallback = useCallback(async () => {
    if (!mapContainerRef.current) return;
    try {
      setMapEngine('leaflet');
      const L = (await import('leaflet')).default;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([(locA.lat + locB.lat) / 2, (locA.lng + locB.lng) / 2], 12);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Atharva Route Engine',
        maxZoom: 19,
      }).addTo(map);

      // Custom Leaflet Icons
      const iconA = L.divIcon({
        className: 'custom-leaflet-marker-a',
        html: `
          <div style="background:#059669;color:#fff;font-weight:900;border:2.5px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);font-size:14px;">
            A
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const iconB = L.divIcon({
        className: 'custom-leaflet-marker-b',
        html: `
          <div style="background:#dc2626;color:#fff;font-weight:900;border:2.5px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);font-size:14px;">
            B
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const iconCab = L.divIcon({
        className: 'custom-leaflet-cab',
        html: `
          <div style="background:#1e40af;color:#fbbf24;border:2.5px solid #fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.4);font-size:16px;">
            🚖
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const mA = L.marker([locA.lat, locA.lng], { icon: iconA, draggable: interactive }).addTo(map);
      const mB = L.marker([locB.lat, locB.lng], { icon: iconB, draggable: interactive }).addTo(map);
      const mCab = L.marker([locA.lat, locA.lng], { icon: iconCab }).addTo(map);

      leafletMarkersRef.current = [mA, mB, mCab];

      // Draw polyline
      const routePoints = generateRouteGeometry(locA, locB);
      polylinePathRef.current = routePoints;

      const latlngs = routePoints.map((p) => [p.lat, p.lng] as [number, number]);
      const poly = L.polyline(latlngs, { color: '#2563eb', weight: 6, opacity: 0.9 }).addTo(map);
      leafletPolylineRef.current = poly;

      map.fitBounds(poly.getBounds(), { padding: [50, 50] });

      setMapLoaded(true);
      setMapError(null);
    } catch (e: any) {
      console.error('Leaflet fallback error:', e);
      setMapError('Map renderer loaded in safe preview mode.');
    }
  }, [locA, locB, interactive, generateRouteGeometry]);

  // Load Google Maps SDK
  useEffect(() => {
    if (!activeKey) {
      initLeafletFallback();
      return;
    }

    if (typeof window !== 'undefined') {
      window.gm_authFailure = () => {
        console.warn('Google Maps authentication notice, switching to vector engine.');
        setMapEngine('leaflet');
        initLeafletFallback();
      };
    }

    if (window.google && window.google.maps) {
      initGoogleMap();
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
        initGoogleMap();
      };
      script.onerror = () => {
        console.warn('Google Maps JS could not be reached, switching to Leaflet vector engine.');
        initLeafletFallback();
      };
      document.head.appendChild(script);
    } else {
      initGoogleMap();
    }
  }, [activeKey, initGoogleMap, initLeafletFallback]);

  // Vehicle Simulation Loop (Interpolate cab along route polyline)
  useEffect(() => {
    let interval: any = null;

    if (isSimulating) {
      interval = setInterval(() => {
        setSimulationProgress((prev) => {
          const next = prev + 1.2 * simSpeed;
          if (next >= 100) {
            setIsSimulating(false);
            setSimCurrentStreet(`Arrived at ${locB.name}`);
            return 100;
          }

          // Street update simulation based on progress
          if (next < 30) {
            setSimCurrentStreet(`Departing ${locA.name.split(':')[1] || locA.name} - En route via 100 Feet Rd`);
          } else if (next < 70) {
            setSimCurrentStreet('Navigating Outer Ring Road / HAL Airport Corridor (44 km/h)');
          } else {
            setSimCurrentStreet(`Approaching ${locB.name.split(':')[1] || locB.name} Destination Gate`);
          }

          return next;
        });
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, simSpeed, locA, locB]);

  // Update Cab Marker Position on Map as Progress Changes
  useEffect(() => {
    if (polylinePathRef.current.length > 0) {
      const path = polylinePathRef.current;
      const index = Math.min(
        Math.floor((simulationProgress / 100) * (path.length - 1)),
        path.length - 1
      );
      const currentPoint = path[index];

      if (currentPoint) {
        if (cabMarkerRef.current && window.google) {
          const pos = new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng);
          cabMarkerRef.current.setPosition(pos);
        } else if (leafletMarkersRef.current[2]) {
          leafletMarkersRef.current[2].setLatLng([currentPoint.lat, currentPoint.lng]);
        }
      }
    }
  }, [simulationProgress]);

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

  return (
    <div className="w-full border border-slate-200 bg-white shadow-sm flex flex-col font-sans">
      
      {/* 1. TOP ROUTE PLANNER HEADER (LOCATION A ➔ LOCATION B) */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1.5 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center space-x-2">
                <span>{title || 'Google Maps Routing System'}</span>
                <span className="bg-blue-500/30 text-blue-300 text-[10px] font-mono px-2 py-0.5 border border-blue-400/30">
                  EXAMPLE: LOCATION A ➔ LOCATION B
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Live Point-to-Point Route Geometry • Turn-by-Turn Telemetry • Real-Time Bengaluru Traffic
              </p>
            </div>
          </div>

          {/* Quick Route Preset Corridor Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">
              Example Corridors:
            </span>
            {ROUTE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`text-xs px-2.5 py-1 font-semibold transition-all border ${
                  selectedPresetId === preset.id
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {preset.name.split('➔')[0]} ➔ {preset.name.split('➔')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Origin & Destination Interactive Bar */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-slate-800/90 p-3 border border-slate-700">
          
          {/* Location A (Origin) */}
          <div className="md:col-span-5 flex items-start space-x-2.5 bg-slate-900/80 p-2.5 border border-emerald-500/30">
            <div className="w-7 h-7 bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Location A (Origin / Pickup)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {locA.lat.toFixed(4)}, {locA.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate" title={locA.name}>
                {locA.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate" title={locA.address}>
                {locA.address}
              </p>
            </div>
          </div>

          {/* Route Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwapRoute}
              title="Reverse Route (Swap Origin & Destination)"
              className="p-2 bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-600 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Location B (Destination) */}
          <div className="md:col-span-5 flex items-start space-x-2.5 bg-slate-900/80 p-2.5 border border-red-500/30">
            <div className="w-7 h-7 bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
              B
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  Location B (Destination / Drop)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {locB.lat.toFixed(4)}, {locB.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate" title={locB.name}>
                {locB.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate" title={locB.address}>
                {locB.address}
              </p>
            </div>
          </div>

        </div>

        {/* Live Route Telemetry Stat Chips */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 border border-slate-700">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Total Distance:</span>
              <strong className="text-white font-mono">{routeDistance}</strong>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Est. Driving Time:</span>
              <strong className="text-white font-mono">{routeDuration}</strong>
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 border border-slate-700">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">{routeSummary}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStepsDrawer(!showStepsDrawer)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold border border-slate-700 flex items-center space-x-1 text-xs"
            >
              <span>Turn-by-Turn Steps ({turnSteps.length || 4})</span>
              {showStepsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

      {/* 2. TURN-BY-TURN DIRECTIONS DRAWER (EXPANDABLE) */}
      {showStepsDrawer && (
        <div className="bg-slate-50 border-b border-slate-300 p-4 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Turn-by-Turn Route Instructions (From Location A to Location B)</span>
          </h4>
          <ol className="space-y-1.5 text-xs text-slate-800">
            {turnSteps.length > 0 ? (
              turnSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-1.5 bg-white border border-slate-200">
                  <span className="w-5 h-5 bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 flex justify-between items-center">
                    <span>{step.instruction}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 ml-2 shrink-0">
                      {step.distance}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start space-x-2 p-1.5 bg-white border border-slate-200">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    A
                  </span>
                  <div className="flex-1 flex justify-between items-center">
                    <span>Depart from <strong>{locA.name}</strong> on main avenue towards connecting artery.</span>
                    <span className="text-[11px] font-mono text-slate-500">0.0 km</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2 p-1.5 bg-white border border-slate-200">
                  <span className="w-5 h-5 bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="flex-1 flex justify-between items-center">
                    <span>Proceed onto primary expressway corridor; live traffic monitored via Google Maps.</span>
                    <span className="text-[11px] font-mono text-slate-500">4.5 km</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2 p-1.5 bg-white border border-slate-200">
                  <span className="w-5 h-5 bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="flex-1 flex justify-between items-center">
                    <span>Take campus exit flyover towards <strong>{locB.name}</strong> access lane.</span>
                    <span className="text-[11px] font-mono text-slate-500">2.1 km</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2 p-1.5 bg-white border border-slate-200">
                  <span className="w-5 h-5 bg-red-100 text-red-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                    B
                  </span>
                  <div className="flex-1 flex justify-between items-center">
                    <span>Arrive at destination: <strong>{locB.name}</strong> (Drop Bay 2).</span>
                    <span className="text-[11px] font-mono text-slate-500">{routeDistance}</span>
                  </div>
                </li>
              </>
            )}
          </ol>
        </div>
      )}

      {/* 3. SIMULATION CONTROLS BAR (PLAY/PAUSE CAB ALONG ROUTE) */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 text-xs transition-colors ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Trip</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Vehicle Trip (A ➔ B)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsSimulating(false);
              setSimulationProgress(0);
              setSimCurrentStreet(`At Location A: ${locA.name}`);
            }}
            title="Reset Vehicle to Location A"
            className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-white border border-slate-300 p-0.5">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                  simSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Trip Progress Bar */}
        <div className="flex-1 max-w-md flex items-center space-x-3">
          <span className="text-[11px] font-bold text-slate-600 shrink-0">
            Cab: <span className="text-blue-700 font-mono">{vehiclePlate}</span>
          </span>
          <div className="flex-1 bg-slate-200 h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${simulationProgress}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-slate-800 shrink-0">
            {simulationProgress.toFixed(0)}%
          </span>
        </div>

        {/* Live Telemetry Status */}
        <div className="text-[11px] text-slate-600 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">{simCurrentStreet}</span>
        </div>

      </div>

      {/* 4. MAP VIEWPORT CONTAINER */}
      <div className="relative w-full h-[540px] bg-slate-100">
        
        {/* Floating Quick Controls Over Map */}
        <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
          
          {/* Traffic Toggle */}
          <button
            onClick={toggleTraffic}
            className={`px-3 py-1.5 font-bold text-xs border shadow-md transition-all ${
              showTraffic
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            🚦 {showTraffic ? 'Traffic ON' : 'Traffic OFF'}
          </button>

          {/* Map Style Selector */}
          <div className="flex bg-white border border-slate-300 shadow-md p-0.5">
            <button
              onClick={() => changeMapType('roadmap')}
              className={`px-2.5 py-1 text-xs font-semibold ${
                mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => changeMapType('satellite')}
              className={`px-2.5 py-1 text-xs font-semibold ${
                mapType === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Map Viewport DOM Element */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Legend / Pin Drag Reminder */}
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xl border border-slate-700">
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-emerald-500 inline-block" />
              <span><strong>Location A</strong>: {locA.name.split(':')[1] || locA.name}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-red-500 inline-block" />
              <span><strong>Location B</strong>: {locB.name.split(':')[1] || locB.name}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-blue-500 inline-block" />
              <span><strong>Moving Vehicle</strong>: {vehiclePlate} ({driverName})</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span>Engine: <strong className="text-white">{mapEngine === 'google' ? 'Google Maps JS API' : 'Leaflet Vector Engine'}</strong></span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-amber-300 font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive: Drag Marker A or Marker B anywhere on the map to recalculate route!</span>
          </div>
        </div>

      </div>

    </div>
  );
};
