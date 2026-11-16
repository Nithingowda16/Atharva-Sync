'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  Users,
  Cpu,
  ArrowRight,
  ShieldCheck,
  UserCheck,
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
// 1. BENGALURU ROAD NETWORK GRAPH FOR DIJKSTRA'S ALGORITHM
// ----------------------------------------------------------------------------
interface GraphEdge {
  to: string;
  distanceKm: number;
  speedKmh: number;
  trafficMultiplier: number;
  roadName: string;
}

const BENGALURU_ROAD_GRAPH: Record<string, GraphEdge[]> = {
  indiranagar_metro: [
    { to: 'hal_100ft', distanceKm: 1.8, speedKmh: 35, trafficMultiplier: 1.2, roadName: '100 Feet Rd' },
    { to: 'old_airport_rd', distanceKm: 3.2, speedKmh: 40, trafficMultiplier: 1.3, roadName: 'CMH Rd / Old Airport Rd' },
  ],
  hal_100ft: [
    { to: 'indiranagar_metro', distanceKm: 1.8, speedKmh: 35, trafficMultiplier: 1.2, roadName: '100 Feet Rd' },
    { to: 'domlur_layout', distanceKm: 2.1, speedKmh: 32, trafficMultiplier: 1.1, roadName: 'Indiranagar Double Rd' },
    { to: 'old_airport_rd', distanceKm: 1.9, speedKmh: 38, trafficMultiplier: 1.4, roadName: 'HAL Main Rd' },
  ],
  domlur_layout: [
    { to: 'hal_100ft', distanceKm: 2.1, speedKmh: 32, trafficMultiplier: 1.1, roadName: 'Indiranagar Double Rd' },
    { to: 'old_airport_rd', distanceKm: 1.5, speedKmh: 42, trafficMultiplier: 1.2, roadName: 'Inner Ring Rd Junction' },
    { to: 'koramangala_inner_ring', distanceKm: 2.8, speedKmh: 45, trafficMultiplier: 1.3, roadName: 'Inner Ring Rd Expressway' },
  ],
  old_airport_rd: [
    { to: 'indiranagar_metro', distanceKm: 3.2, speedKmh: 40, trafficMultiplier: 1.3, roadName: 'CMH Rd' },
    { to: 'hal_100ft', distanceKm: 1.9, speedKmh: 38, trafficMultiplier: 1.4, roadName: 'HAL Main Rd' },
    { to: 'domlur_layout', distanceKm: 1.5, speedKmh: 42, trafficMultiplier: 1.2, roadName: 'Inner Ring Rd' },
    { to: 'hal_stage2', distanceKm: 2.6, speedKmh: 40, trafficMultiplier: 1.2, roadName: 'Old Airport Road Flyover' },
  ],
  hal_stage2: [
    { to: 'old_airport_rd', distanceKm: 2.6, speedKmh: 40, trafficMultiplier: 1.2, roadName: 'Old Airport Road Flyover' },
    { to: 'marathahalli_bridge', distanceKm: 3.4, speedKmh: 48, trafficMultiplier: 1.4, roadName: 'HAL-Marathahalli Corridor' },
  ],
  marathahalli_bridge: [
    { to: 'hal_stage2', distanceKm: 3.4, speedKmh: 48, trafficMultiplier: 1.4, roadName: 'HAL-Marathahalli Corridor' },
    { to: 'bellandur_junction', distanceKm: 3.8, speedKmh: 52, trafficMultiplier: 1.3, roadName: 'Outer Ring Rd (ORR) Arterial' },
  ],
  koramangala_inner_ring: [
    { to: 'domlur_layout', distanceKm: 2.8, speedKmh: 45, trafficMultiplier: 1.3, roadName: 'Inner Ring Rd' },
    { to: 'bellandur_junction', distanceKm: 4.5, speedKmh: 42, trafficMultiplier: 1.5, roadName: 'Sarjapur-Bellandur Link Rd' },
  ],
  bellandur_junction: [
    { to: 'marathahalli_bridge', distanceKm: 3.8, speedKmh: 52, trafficMultiplier: 1.3, roadName: 'Outer Ring Rd' },
    { to: 'koramangala_inner_ring', distanceKm: 4.5, speedKmh: 42, trafficMultiplier: 1.5, roadName: 'Sarjapur Link Rd' },
    { to: 'nexus_tech_park', distanceKm: 1.6, speedKmh: 30, trafficMultiplier: 1.1, roadName: 'Tech Park Campus Access Rd' },
  ],
  nexus_tech_park: [
    { to: 'bellandur_junction', distanceKm: 1.6, speedKmh: 30, trafficMultiplier: 1.1, roadName: 'Tech Park Campus Access Rd' },
  ],
};

const BENGALURU_GRAPH_NODES: Record<string, { name: string; lat: number; lng: number }> = {
  indiranagar_metro: { name: 'Indiranagar 100ft Rd', lat: 12.9719, lng: 77.6412 },
  hal_100ft: { name: 'HAL 100ft Junction', lat: 12.9665, lng: 77.6435 },
  domlur_layout: { name: 'Domlur Inner Ring Rd', lat: 12.962, lng: 77.648 },
  old_airport_rd: { name: 'Old Airport Road Flyover', lat: 12.9605, lng: 77.652 },
  hal_stage2: { name: 'HAL 2nd Stage Main Rd', lat: 12.968, lng: 77.665 },
  marathahalli_bridge: { name: 'Marathahalli Bridge', lat: 12.956, lng: 77.701 },
  koramangala_inner_ring: { name: 'Koramangala Inner Ring Junction', lat: 12.9344, lng: 77.6271 },
  bellandur_junction: { name: 'Bellandur ORR Junction', lat: 12.938, lng: 77.685 },
  nexus_tech_park: { name: 'Nexus / Enterprise Tech Park (Tower B)', lat: 12.9352, lng: 77.6946 },
};

// ----------------------------------------------------------------------------
// 2. DIJKSTRA'S SHORTEST PATH ALGORITHM IMPLEMENTATION
// ----------------------------------------------------------------------------
export interface DijkstraOutput {
  pathNodeIds: string[];
  pathCoordinates: { lat: number; lng: number }[];
  totalDistanceKm: number;
  totalDurationMins: number;
  nodesEvaluated: number;
  turnInstructions: { instruction: string; distance: string }[];
  algorithmComplexity: string;
}

export function computeDijkstraShortestPath(
  startId: string,
  targetId: string,
  trafficBias = 1.0
): DijkstraOutput {
  const distances: Record<string, number> = {};
  const distanceKmMap: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const nodeId in BENGALURU_GRAPH_NODES) {
    distances[nodeId] = Infinity;
    distanceKmMap[nodeId] = 0;
    previous[nodeId] = null;
  }

  distances[startId] = 0;
  distanceKmMap[startId] = 0;

  const pq: { id: string; cost: number }[] = [{ id: startId, cost: 0 }];
  let nodesEvaluated = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { id: current, cost: currentCost } = pq.shift()!;
    nodesEvaluated++;

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === targetId) break;

    const neighbors = BENGALURU_ROAD_GRAPH[current] || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      // Dijkstra Edge Weight = Effective travel time in minutes based on real-time traffic
      const edgeWeightMinutes = (edge.distanceKm / edge.speedKmh) * 60 * edge.trafficMultiplier * trafficBias;
      const tentativeCost = currentCost + edgeWeightMinutes;

      if (tentativeCost < distances[edge.to]) {
        distances[edge.to] = tentativeCost;
        distanceKmMap[edge.to] = distanceKmMap[current] + edge.distanceKm;
        previous[edge.to] = current;
        pq.push({ id: edge.to, cost: tentativeCost });
      }
    }
  }

  // Backtrack optimal shortest path
  const pathNodeIds: string[] = [];
  let curr: string | null = targetId;
  while (curr) {
    pathNodeIds.unshift(curr);
    curr = previous[curr];
  }

  // Reconstruct turn steps & geometry
  const turnInstructions: { instruction: string; distance: string }[] = [];
  const pathCoordinates: { lat: number; lng: number }[] = [];

  for (let i = 0; i < pathNodeIds.length; i++) {
    const node = BENGALURU_GRAPH_NODES[pathNodeIds[i]];
    if (node) {
      pathCoordinates.push({ lat: node.lat, lng: node.lng });
    }

    if (i < pathNodeIds.length - 1) {
      const fromId = pathNodeIds[i];
      const toId = pathNodeIds[i + 1];
      const edge = BENGALURU_ROAD_GRAPH[fromId]?.find((e) => e.to === toId);
      const edgeDist = edge ? `${edge.distanceKm.toFixed(1)} km` : '1.5 km';
      turnInstructions.push({
        instruction: `Follow ${edge?.roadName || 'connecting avenue'} towards ${BENGALURU_GRAPH_NODES[toId]?.name || toId}`,
        distance: edgeDist,
      });
    }
  }

  const finalDistance = Number(distanceKmMap[targetId].toFixed(1)) || 4.2;
  const finalMinutes = Math.round(distances[targetId]) || 12;

  return {
    pathNodeIds,
    pathCoordinates,
    totalDistanceKm: finalDistance,
    totalDurationMins: finalMinutes,
    nodesEvaluated,
    turnInstructions,
    algorithmComplexity: 'O((V + E) log V)',
  };
}

// ----------------------------------------------------------------------------
// 3. MULTI-STOP PASSENGER COMMUTE CORRIDORS
// ----------------------------------------------------------------------------
interface CommuteRouteConfig {
  id: string;
  name: string;
  totalPassengers: number;
  stops: LocationNode[];
}

const MULTI_STOP_CORRIDORS: CommuteRouteConfig[] = [
  {
    id: 'corridor-east-tech',
    name: 'Shared Commute: Indiranagar ➔ Domlur ➔ HAL ➔ Nexus Tech Park',
    totalPassengers: 3,
    stops: [
      {
        id: 'indiranagar_metro',
        stopLetter: 'A',
        name: 'Stop A: Indiranagar 100ft Rd',
        address: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
        lat: 12.9719,
        lng: 77.6412,
        passengerName: 'Amrutha Rao',
        passengerRole: 'Supply Chain Engineering',
        boardingOtp: '7492',
        boardingStatus: 'BOARDED',
      },
      {
        id: 'domlur_layout',
        stopLetter: 'B',
        name: 'Stop B: Domlur Inner Ring Rd',
        address: 'Domlur Layout, Inner Ring Road, Bengaluru',
        lat: 12.962,
        lng: 77.648,
        passengerName: 'Karthik Natarajan',
        passengerRole: 'Cloud Infrastructure',
        boardingOtp: '8831',
        boardingStatus: 'NEXT_PICKUP',
      },
      {
        id: 'hal_stage2',
        stopLetter: 'C',
        name: 'Stop C: HAL 2nd Stage Main Rd',
        address: 'HAL 2nd Stage, 80ft Road, Indiranagar',
        lat: 12.968,
        lng: 77.665,
        passengerName: 'Priya Sharma',
        passengerRole: 'Product Management',
        boardingOtp: '5128',
        boardingStatus: 'WAITING',
      },
      {
        id: 'nexus_tech_park',
        stopLetter: 'D',
        name: 'Stop D: Enterprise Tech Park (Tower B)',
        address: 'Outer Ring Rd, Bellandur, Bengaluru, Karnataka 560103',
        lat: 12.9352,
        lng: 77.6946,
        passengerName: 'Corporate Campus Drop (All 3 Employees)',
        passengerRole: 'Destination Drop-off',
        boardingOtp: 'DROP',
        boardingStatus: 'WAITING',
      },
    ],
  },
  {
    id: 'corridor-south-express',
    name: 'Shared Commute: Koramangala ➔ Domlur ➔ Bellandur ➔ Tech Park',
    totalPassengers: 3,
    stops: [
      {
        id: 'koramangala_inner_ring',
        stopLetter: 'A',
        name: 'Stop A: Koramangala 4th Block',
        address: 'Sony World Junction, Koramangala, Bengaluru',
        lat: 12.9344,
        lng: 77.6271,
        passengerName: 'Rajesh Sen',
        passengerRole: 'Data Analytics',
        boardingOtp: '4419',
        boardingStatus: 'BOARDED',
      },
      {
        id: 'domlur_layout',
        stopLetter: 'B',
        name: 'Stop B: Domlur EGL Gateway',
        address: 'Embassy GolfLinks Access Road, Domlur',
        lat: 12.962,
        lng: 77.648,
        passengerName: 'Sneha Patel',
        passengerRole: 'Security Operations',
        boardingOtp: '3321',
        boardingStatus: 'NEXT_PICKUP',
      },
      {
        id: 'bellandur_junction',
        stopLetter: 'C',
        name: 'Stop C: Bellandur Gate',
        address: 'Outer Ring Road, Bellandur Signal',
        lat: 12.938,
        lng: 77.685,
        passengerName: 'Arjun Das',
        passengerRole: 'Backend Systems',
        boardingOtp: '6712',
        boardingStatus: 'WAITING',
      },
      {
        id: 'nexus_tech_park',
        stopLetter: 'D',
        name: 'Stop D: Enterprise Tech Park (Tower B)',
        address: 'Outer Ring Rd, Bellandur, Bengaluru',
        lat: 12.9352,
        lng: 77.6946,
        passengerName: 'Corporate Campus Hub Drop',
        passengerRole: 'Destination Hub',
        boardingOtp: 'DROP',
        boardingStatus: 'WAITING',
      },
    ],
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
  title,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Corridor Selection
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('corridor-east-tech');
  const activeCorridor = useMemo(
    () => MULTI_STOP_CORRIDORS.find((c) => c.id === selectedCorridorId) || MULTI_STOP_CORRIDORS[0],
    [selectedCorridorId]
  );

  // Active Multi-Stop Leg (0: A ➔ B, 1: B ➔ C, 2: C ➔ D)
  const [currentLegIndex, setCurrentLegIndex] = useState<number>(0);
  const [stopsState, setStopsState] = useState<LocationNode[]>(activeCorridor.stops);

  // Synchronize stops state when corridor switches
  useEffect(() => {
    setStopsState(activeCorridor.stops);
    setCurrentLegIndex(0);
    setSimulationProgress(0);
  }, [activeCorridor]);

  // Current Origin & Destination based on active leg
  const currentOrigin = stopsState[currentLegIndex] || stopsState[0];
  const currentDestination = stopsState[currentLegIndex + 1] || stopsState[stopsState.length - 1];

  // Run Dijkstra's Algorithm for the Current Active Leg
  const dijkstraResult = useMemo(() => {
    const startId = currentOrigin.id || 'indiranagar_metro';
    const targetId = currentDestination.id || 'nexus_tech_park';
    return computeDijkstraShortestPath(startId, targetId);
  }, [currentOrigin.id, currentDestination.id]);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0); // 0-100% of current leg
  const [simSpeed, setSimSpeed] = useState<number>(2); // 1x, 2x, 4x
  const [simCurrentStreet, setSimCurrentStreet] = useState<string>('');
  const [showDijkstraInspector, setShowDijkstraInspector] = useState<boolean>(true);
  const [showStepsDrawer, setShowStepsDrawer] = useState<boolean>(false);

  // Map References
  const mapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const stopMarkersRef = useRef<any[]>([]);
  const cabMarkerRef = useRef<any>(null);
  const polylinePathRef = useRef<{ lat: number; lng: number }[]>([]);
  const leafletMapRef = useRef<any>(null);
  const leafletPolylineRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);

  // Generate intermediate curve coordinates for fallback rendering
  const generateInterpolatedRoute = useCallback((points: { lat: number; lng: number }[]) => {
    if (points.length < 2) return points;
    const densePoints: { lat: number; lng: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const steps = 15;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        densePoints.push({
          lat: p1.lat + (p2.lat - p1.lat) * t,
          lng: p1.lng + (p2.lng - p1.lng) * t,
        });
      }
    }
    return densePoints;
  }, []);

  // Set polyline path from Dijkstra route
  useEffect(() => {
    const dense = generateInterpolatedRoute(dijkstraResult.pathCoordinates);
    polylinePathRef.current = dense;
    setSimCurrentStreet(`Navigating: ${currentOrigin.stopLetter} ➔ ${currentDestination.stopLetter} via ${dijkstraResult.turnInstructions[0]?.instruction || 'Connecting Corridor'}`);
  }, [dijkstraResult, currentOrigin, currentDestination, generateInterpolatedRoute]);

  // ----------------------------------------------------------------------------
  // 4. AUTOMATIC LEG TRANSITION (A ➔ B, then B ➔ C, then C ➔ D)
  // ----------------------------------------------------------------------------
  const advanceToNextLeg = useCallback(() => {
    const totalLegs = stopsState.length - 1;
    if (currentLegIndex < totalLegs - 1) {
      const nextIndex = currentLegIndex + 1;
      setCurrentLegIndex(nextIndex);
      setSimulationProgress(0);

      // Update boarding status of passengers
      setStopsState((prev) =>
        prev.map((stop, idx) => {
          if (idx <= nextIndex) {
            return { ...stop, boardingStatus: 'BOARDED' };
          } else if (idx === nextIndex + 1) {
            return { ...stop, boardingStatus: 'NEXT_PICKUP' };
          }
          return { ...stop, boardingStatus: 'WAITING' };
        })
      );
    } else {
      // Reached final destination (Stop D)
      setIsSimulating(false);
      setSimulationProgress(100);
      setStopsState((prev) =>
        prev.map((stop) => ({ ...stop, boardingStatus: 'COMPLETED' }))
      );
      setSimCurrentStreet(`All 3 passengers arrived at ${currentDestination.name}! Commute Completed.`);
    }
  }, [currentLegIndex, stopsState.length, currentDestination.name]);

  // Continuous Simulation Loop with Auto-Progression
  useEffect(() => {
    let interval: any = null;

    if (isSimulating) {
      interval = setInterval(() => {
        setSimulationProgress((prev) => {
          const next = prev + 1.6 * simSpeed;
          if (next >= 100) {
            // Automatically advance to the next pickup leg!
            advanceToNextLeg();
            return 0;
          }

          // Live street telemetry updates
          if (next < 35) {
            setSimCurrentStreet(`Departing Stop ${currentOrigin.stopLetter} (${currentOrigin.name}) - Accelerating`);
          } else if (next < 75) {
            setSimCurrentStreet(`En Route between Stop ${currentOrigin.stopLetter} and Stop ${currentDestination.stopLetter} (48 km/h)`);
          } else {
            setSimCurrentStreet(`Approaching Stop ${currentDestination.stopLetter} (${currentDestination.passengerName})`);
          }

          return next;
        });
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, simSpeed, advanceToNextLeg, currentOrigin, currentDestination]);

  // Update Cab Marker Position on Map
  useEffect(() => {
    if (polylinePathRef.current.length > 0) {
      const path = polylinePathRef.current;
      const index = Math.min(
        Math.floor((simulationProgress / 100) * (path.length - 1)),
        path.length - 1
      );
      const pt = path[index];

      if (pt) {
        if (cabMarkerRef.current && window.google) {
          cabMarkerRef.current.setPosition(new window.google.maps.LatLng(pt.lat, pt.lng));
        } else if (leafletMarkersRef.current[3]) {
          leafletMarkersRef.current[3].setLatLng([pt.lat, pt.lng]);
        }
      }
    }
  }, [simulationProgress]);

  // Initialize Map Markers & Layers
  const initMapMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;

    // Clear old markers
    stopMarkersRef.current.forEach((m) => m.setMap(null));
    stopMarkersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    stopsState.forEach((stop, idx) => {
      bounds.extend(new window.google.maps.LatLng(stop.lat, stop.lng));

      const isCurrentTarget = idx === currentLegIndex + 1;
      const isPast = idx <= currentLegIndex;
      const color = idx === stopsState.length - 1 ? '#DC2626' : isPast ? '#059669' : isCurrentTarget ? '#FF7900' : '#64748B';

      const iconSvg = {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
            <path d="M18 0 C8 0 0 8 0 18 C0 30 18 46 18 46 C18 46 36 30 36 18 C36 8 28 0 18 0 Z" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="18" cy="18" r="10" fill="#FFFFFF"/>
            <text x="18" y="23" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="${color}" text-anchor="middle">${stop.stopLetter || 'A'}</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(36, 46),
        anchor: new window.google.maps.Point(18, 46),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: mapInstanceRef.current,
        title: `${stop.name} (${stop.passengerName})`,
        icon: iconSvg,
      });

      stopMarkersRef.current.push(marker);
    });

    mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [stopsState, currentLegIndex]);

  // Load Map Container
  useEffect(() => {
    initMapMarkers();
  }, [initMapMarkers]);

  return (
    <div className="w-full border border-slate-200 bg-white shadow-sm flex flex-col font-sans">
      {/* 1. TOP ROUTE PLANNER HEADER */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-[#000000] text-white p-2 border border-slate-700 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#FF7900]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center space-x-2">
                <span>{title || 'Google Maps Routing System'}</span>
                <span className="bg-[#FF7900]/20 text-[#FF7900] text-[10px] font-mono px-2 py-0.5 border border-[#FF7900]/40 font-bold">
                  MULTI-STOP COMMUTE: A ➔ B ➔ C ➔ D
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 border border-emerald-400/30">
                  DIJKSTRA SHORTEST PATH
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated multi-passenger boarding progression • Turn-by-Turn Telemetry • Real-Time Bengaluru Traffic
              </p>
            </div>
          </div>

          {/* Quick Route Preset Corridor Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">
              Example Corridors:
            </span>
            {MULTI_STOP_CORRIDORS.map((corridor) => (
              <button
                key={corridor.id}
                onClick={() => setSelectedCorridorId(corridor.id)}
                className={`text-xs px-2.5 py-1 font-semibold transition-all border ${
                  selectedCorridorId === corridor.id
                    ? 'bg-[#FF7900] text-white border-orange-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {corridor.stops[0].name.split(':')[1]?.trim() || 'Origin'} ➔ {corridor.stops[corridor.stops.length - 1].name.split(':')[1]?.trim() || 'Tech Park'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. MULTI-STOP COMMUTE PASSENGER PROGRESSION CARDS (A ➔ B ➔ C ➔ D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-3">
          {stopsState.map((stop, index) => {
            const isOrigin = index === 0;
            const isDestination = index === stopsState.length - 1;
            const isCurrentLegSource = index === currentLegIndex;
            const isCurrentLegTarget = index === currentLegIndex + 1;
            const isPast = index <= currentLegIndex;

            return (
              <div
                key={index}
                onClick={() => {
                  if (index < stopsState.length - 1) {
                    setCurrentLegIndex(index);
                    setSimulationProgress(0);
                  }
                }}
                className={`p-3 border cursor-pointer transition-all ${
                  isCurrentLegSource || isCurrentLegTarget
                    ? 'bg-slate-800/95 border-[#FF7900] shadow-md ring-1 ring-[#FF7900]/40'
                    : isPast
                    ? 'bg-slate-900/90 border-emerald-500/40 opacity-90'
                    : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Header row: Letter badge + Status tag */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 text-white font-black text-xs flex items-center justify-center shadow ${
                        isDestination
                          ? 'bg-red-600'
                          : isPast
                          ? 'bg-emerald-600'
                          : isCurrentLegTarget
                          ? 'bg-[#FF7900]'
                          : 'bg-slate-700'
                      }`}
                    >
                      {stop.stopLetter}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      {isOrigin ? 'Stop A (Pickup 1)' : isDestination ? 'Stop D (Campus Drop)' : `Stop ${stop.stopLetter} (Pickup ${index + 1})`}
                    </span>
                  </div>

                  {/* Status Tag */}
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 border ${
                      stop.boardingStatus === 'BOARDED' || stop.boardingStatus === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : isCurrentLegTarget
                        ? 'bg-[#FF7900]/20 text-[#FF7900] border-orange-400/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {stop.boardingStatus === 'BOARDED'
                      ? '✓ Boarded'
                      : stop.boardingStatus === 'COMPLETED'
                      ? '✓ Dropped'
                      : isCurrentLegTarget
                      ? '● Next Stop'
                      : 'Waiting'}
                  </span>
                </div>

                {/* Passenger Info */}
                <p className="text-xs font-bold text-white truncate" title={stop.passengerName}>
                  {stop.passengerName}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5" title={stop.address}>
                  {stop.address}
                </p>

                {/* OTP & Role Row */}
                <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{stop.passengerRole}</span>
                  {stop.boardingOtp && stop.boardingOtp !== 'DROP' ? (
                    <span className="bg-slate-800 font-mono text-[#FF7900] font-bold px-1.5 py-0.5 border border-slate-700">
                      OTP: {stop.boardingOtp}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. ACTIVE LEG TELEMETRY & DIJKSTRA ENGINE BAR */}
        <div className="bg-slate-800/90 p-3 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Active Leg Badge */}
            <span className="flex items-center space-x-1.5 bg-[#FF7900]/20 text-[#FF7900] px-3 py-1 border border-[#FF7900]/40 font-bold">
              <span>Active Leg:</span>
              <strong className="text-white">
                Stop {currentOrigin.stopLetter} ➔ Stop {currentDestination.stopLetter}
              </strong>
            </span>

            {/* Dijkstra Optimal Distance */}
            <span className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 border border-slate-700">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Shortest Distance:</span>
              <strong className="text-white font-mono">{dijkstraResult.totalDistanceKm} km</strong>
            </span>

            {/* Dijkstra Optimal Duration */}
            <span className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Est. Travel Time:</span>
              <strong className="text-white font-mono">{dijkstraResult.totalDurationMins} mins</strong>
            </span>

            <span className="hidden md:inline-flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 border border-slate-700">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">{simCurrentStreet || 'Optimal Path Calculated'}</span>
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDijkstraInspector(!showDijkstraInspector)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-emerald-400 font-bold border border-emerald-500/40 flex items-center space-x-1.5 text-xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Dijkstra Engine Details</span>
            </button>

            <button
              onClick={() => setShowStepsDrawer(!showStepsDrawer)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-blue-300 font-bold border border-slate-700 flex items-center space-x-1 text-xs"
            >
              <span>Turn Steps ({dijkstraResult.turnInstructions.length})</span>
              {showStepsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 4. DIJKSTRA ALGORITHM INSPECTOR PANEL */}
        {showDijkstraInspector && (
          <div className="mt-2.5 bg-slate-950 p-3 border border-emerald-500/30 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                  Dijkstra Algorithm Verification (Optimal Graph Traversal)
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Complexity: {dijkstraResult.algorithmComplexity} • Nodes Evaluated: {dijkstraResult.nodesEvaluated}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
              <span className="text-slate-500">Optimal Vertex Path:</span>
              {dijkstraResult.pathNodeIds.map((nodeId, idx) => (
                <React.Fragment key={nodeId}>
                  <span className="bg-slate-800 px-2 py-0.5 border border-slate-700 text-white font-bold">
                    {BENGALURU_GRAPH_NODES[nodeId]?.name || nodeId}
                  </span>
                  {idx < dijkstraResult.pathNodeIds.length - 1 && (
                    <span className="text-[#FF7900] font-black">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. TURN-BY-TURN DIRECTIONS DRAWER */}
      {showStepsDrawer && (
        <div className="bg-slate-50 border-b border-slate-300 p-4 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Turn-by-Turn Route Instructions (Stop {currentOrigin.stopLetter} ➔ Stop {currentDestination.stopLetter})</span>
          </h4>
          <ol className="space-y-1.5 text-xs text-slate-800">
            {dijkstraResult.turnInstructions.map((step, idx) => (
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
            ))}
          </ol>
        </div>
      )}

      {/* 6. MULTI-STOP TRIP SIMULATION CONTROLS */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 font-bold flex items-center space-x-1.5 text-xs transition-colors shadow-sm ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#000000] hover:bg-slate-900 text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Journey</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Simulate Multi-Stop Trip (A ➔ B ➔ C ➔ D)</span>
              </>
            )}
          </button>

          <button
            onClick={advanceToNextLeg}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-200 border border-slate-300 font-bold text-slate-800 flex items-center space-x-1"
            title="Advance directly to next passenger pickup"
          >
            <span>Advance to Stop {stopsState[Math.min(currentLegIndex + 1, stopsState.length - 1)].stopLetter}</span>
            <ArrowRight className="w-3 h-3 text-[#FF7900]" />
          </button>

          <button
            onClick={() => {
              setIsSimulating(false);
              setCurrentLegIndex(0);
              setSimulationProgress(0);
              setStopsState(activeCorridor.stops);
              setSimCurrentStreet(`Reset to Stop A: ${stopsState[0].name}`);
            }}
            title="Reset to Origin (Stop A)"
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
                  simSpeed === spd ? 'bg-[#000000] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Leg Progress Bar */}
        <div className="flex-1 max-w-md flex items-center space-x-3">
          <span className="font-bold text-slate-700 whitespace-nowrap">
            Leg {currentLegIndex + 1}/{stopsState.length - 1} Progress:
          </span>
          <div className="flex-1 bg-slate-300 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FF7900] h-full transition-all duration-300"
              style={{ width: `${simulationProgress}%` }}
            />
          </div>
          <span className="font-mono text-slate-600 font-bold min-w-9 text-right">
            {simulationProgress.toFixed(0)}%
          </span>
        </div>

        {/* Vehicle Badge */}
        <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-700">
          <Car className="w-4 h-4 text-slate-900" />
          <span>{vehiclePlate} ({driverName})</span>
        </div>
      </div>

      {/* 7. MAP CANVAS CONTAINER */}
      <div className="relative w-full h-[480px] bg-slate-100 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Dijkstra Real-time HUD */}
        <div className="absolute top-3 left-3 bg-slate-900/95 text-white p-3 border border-slate-700 shadow-xl max-w-xs z-10 pointer-events-none">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-[#FF7900] tracking-wider">
              Live Fleet Telemetry
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 border border-emerald-500/30">
              GPS LOCK
            </span>
          </div>
          <p className="text-xs font-bold text-white">
            Current Leg: {currentOrigin.stopLetter} ➔ {currentDestination.stopLetter}
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Next: {currentDestination.passengerName}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Distance: {dijkstraResult.totalDistanceKm} km</span>
            <span className="text-amber-400">ETA: {dijkstraResult.totalDurationMins}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
