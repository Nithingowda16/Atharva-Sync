'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldAlert,
  Car,
  Users,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Radio,
  FileSpreadsheet,
  Phone,
  KeyRound,
  Compass,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
  Shield,
  ShieldCheck,
  Lock,
  Layers,
  HelpCircle,
  Search,
  Maximize2,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronRight,
  Megaphone,
  User,
  Bus,
  BarChart3,
  Settings,
  X,
  ExternalLink,
  Calendar,
  Download,
  Check,
} from 'lucide-react';
import { LocationIssueModal } from '@/components/LocationIssueModal';
import { GoogleMapsTracker } from '@/components/GoogleMapsTracker';
import { SettingsModule, SettingsSubTab } from '@/components/SettingsModule';

type LoginRole = 'vendor' | 'admin';
type ViewState = 'login' | 'vendor-portal' | 'admin-portal';

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  companyName?: string;
  staffCode?: string;
  deskRole?: string;
}

interface CommuterRecord {
  id: string;
  empCode: string;
  name: string;
  department: string;
  phone: string;
  tripId: string;
  direction: 'LOGIN' | 'LOGOUT';
  shift: string;
  address: string;
  coords: { latitude: number; longitude: number };
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  boardingOtp: string;
  status: 'SCHEDULED' | 'BOARDED' | 'EN_ROUTE' | 'COMPLETED';
  eta: string;
  isReassigned?: boolean;
  reassignmentReason?: string;
  hasEscortGuard?: boolean;
  escortGuardName?: string;
}

interface TripRecord {
  tripId: string;
  direction: 'LOGIN' | 'LOGOUT';
  shift: string;
  route: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
  speed: string;
  eta: string;
  currentLat: number;
  currentLng: number;
  passengers: { empCode: string; name: string }[];
  escortGuard?: string;
}

interface RouteAllocationRecord {
  routeId: string;
  status: 'PENDING' | 'ALLOCATED';
  firstPickup: string;
  firstPickupTime: string;
  drop: string;
  distanceKm: string;
  assignedCount: number;
  totalCapacity: number;
  assignedCabPlate?: string;
  assignedDriver?: string;
  assignedDriverPhone?: string;
  isBackToBack?: boolean;
  needsMarshal?: boolean;
  hasSpecialNeeds?: boolean;
  passengers: {
    empCode: string;
    name: string;
    pickupNode: string;
    pickupTime: string;
    phone: string;
    pin: string;
  }[];
}

const COMMUTER_ROSTER: CommuterRecord[] = [
  {
    id: 'c-1',
    empCode: 'EMP-9042',
    name: 'Amrutha Rao',
    department: 'Core Supply Chain Engineering',
    phone: '+91 98450 11223',
    tripId: 'ATH-8821',
    direction: 'LOGIN',
    shift: '13:30',
    address: 'Golden Palms Apts, Indiranagar 100ft Road',
    coords: { latitude: 12.9719, longitude: 77.6412 },
    vehiclePlate: 'KA-03-HA-8821',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    boardingOtp: '7492',
    status: 'EN_ROUTE',
    eta: '7 mins away',
  },
  {
    id: 'c-2',
    empCode: 'EMP-9018',
    name: 'Priya Sharma',
    department: 'Product Management',
    phone: '+91 98711 22334',
    tripId: 'ATH-8821',
    direction: 'LOGIN',
    shift: '13:30',
    address: 'HAL 2nd Stage, 80ft Road, Indiranagar',
    coords: { latitude: 12.9800, longitude: 77.6250 },
    vehiclePlate: 'KA-03-HA-8821',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    boardingOtp: '3190',
    status: 'BOARDED',
    eta: 'Boarded at 07:18 AM',
  },
  {
    id: 'c-3',
    empCode: 'EMP-9033',
    name: 'Karthik Natarajan',
    department: 'Cloud Infrastructure & DevOps',
    phone: '+91 99887 33445',
    tripId: 'ATH-4310',
    direction: 'LOGIN',
    shift: '14:00',
    address: 'Domlur Layout, Inner Ring Road',
    coords: { latitude: 12.9620, longitude: 77.6480 },
    vehiclePlate: 'KA-05-MJ-4310',
    driverName: 'Mahesh Gowda',
    driverPhone: '+91 98450 77112',
    boardingOtp: '5821',
    status: 'SCHEDULED',
    eta: '14 mins away',
  },
  {
    id: 'c-4',
    empCode: 'EMP-9042',
    name: 'Amrutha Rao',
    department: 'Core Supply Chain Engineering',
    phone: '+91 98450 11223',
    tripId: 'ATH-8821',
    direction: 'LOGOUT',
    shift: '22:30',
    address: 'Golden Palms Apts, Indiranagar 100ft Road',
    coords: { latitude: 12.9719, longitude: 77.6412 },
    vehiclePlate: 'KA-03-HA-8821',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    boardingOtp: '8841',
    status: 'EN_ROUTE',
    eta: 'Departed Campus',
    hasEscortGuard: true,
    escortGuardName: 'Ramesh Singh (#ESC-402)',
  },
  {
    id: 'c-5',
    empCode: 'EMP-9018',
    name: 'Priya Sharma',
    department: 'Product Management',
    phone: '+91 98711 22334',
    tripId: 'ATH-8821',
    direction: 'LOGOUT',
    shift: '22:30',
    address: 'HAL 2nd Stage, 80ft Road, Indiranagar',
    coords: { latitude: 12.9800, longitude: 77.6250 },
    vehiclePlate: 'KA-03-HA-8821',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    boardingOtp: '6029',
    status: 'BOARDED',
    eta: 'Boarded at Campus Gate 1',
    hasEscortGuard: true,
    escortGuardName: 'Ramesh Singh (#ESC-402)',
  },
  {
    id: 'c-6',
    empCode: 'EMP-9055',
    name: 'Sneha Patil',
    department: 'Retail Marketplace Platform',
    phone: '+91 97411 99001',
    tripId: 'ATH-7021',
    direction: 'LOGOUT',
    shift: '21:30',
    address: 'Koramangala 4th Block, 17th Main Rd',
    coords: { latitude: 12.9340, longitude: 77.6220 },
    vehiclePlate: 'KA-01-EQ-9011',
    driverName: 'Venkatesh R.',
    driverPhone: '+91 97400 33881',
    boardingOtp: '4192',
    status: 'SCHEDULED',
    eta: 'Departs in 8 mins',
    hasEscortGuard: true,
    escortGuardName: 'Sunil Kumar (#ESC-510)',
  },
];

const TRIPS_DATA: Record<string, TripRecord> = {
  'ATH-8821': {
    tripId: 'ATH-8821',
    direction: 'LOGIN',
    shift: '13:30',
    route: 'Indiranagar 100ft Rd ➔ HAL ➔ Bellandur Campus',
    vehiclePlate: 'KA-03-HA-8821',
    vehicleModel: 'Toyota Innova Crysta',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    speed: '34 km/h',
    eta: '7 mins away',
    currentLat: 12.9760,
    currentLng: 77.6320,
    passengers: [
      { empCode: 'EMP-9042', name: 'Amrutha Rao' },
      { empCode: 'EMP-9018', name: 'Priya Sharma' },
    ],
    escortGuard: 'Ramesh Singh (#ESC-402)',
  },
  'ATH-4310': {
    tripId: 'ATH-4310',
    direction: 'LOGIN',
    shift: '14:00',
    route: 'Whitefield ITPL ➔ Marathahalli ➔ Bellandur Campus',
    vehiclePlate: 'KA-05-MJ-4310',
    vehicleModel: 'Toyota Innova',
    driverName: 'Mahesh Gowda',
    driverPhone: '+91 98450 77112',
    speed: '28 km/h',
    eta: '14 mins away',
    currentLat: 12.9840,
    currentLng: 77.7280,
    passengers: [
      { empCode: 'EMP-9033', name: 'Karthik Natarajan' },
    ],
  },
  'ATH-7021': {
    tripId: 'ATH-7021',
    direction: 'LOGOUT',
    shift: '21:30',
    route: 'Koramangala ➔ HSR Layout ➔ Bellandur Campus',
    vehiclePlate: 'KA-01-EQ-9011',
    vehicleModel: 'Force Urbania Tempo',
    driverName: 'Venkatesh R.',
    driverPhone: '+91 97400 33881',
    speed: '31 km/h',
    eta: '8 mins away',
    currentLat: 12.9340,
    currentLng: 77.6220,
    passengers: [
      { empCode: 'EMP-9055', name: 'Sneha Patil' },
    ],
    escortGuard: 'Sunil Kumar (#ESC-510)',
  },
};

const INITIAL_ROUTES: RouteAllocationRecord[] = [
  {
    routeId: '3902992',
    status: 'PENDING',
    firstPickup: 'Domlur',
    firstPickupTime: '10:43',
    drop: '*Tech Park Campus (0.00 km)',
    distanceKm: '11.4 km',
    assignedCount: 0,
    totalCapacity: 3,
    isBackToBack: false,
    needsMarshal: false,
    hasSpecialNeeds: false,
    passengers: [
      { empCode: 'EMP-9033', name: 'Karthik Natarajan', pickupNode: 'Domlur Inner Ring Rd', pickupTime: '10:43', phone: '+91 99887 33445', pin: '5821' },
      { empCode: 'EMP-9042', name: 'Amrutha Rao', pickupNode: 'Indiranagar 100ft Rd', pickupTime: '10:52', phone: '+91 98450 11223', pin: '7492' },
      { empCode: 'EMP-9018', name: 'Priya Sharma', pickupNode: 'HAL 2nd Stage 80ft Rd', pickupTime: '11:02', phone: '+91 98711 22334', pin: '3190' },
    ],
  },
  {
    routeId: '3902995',
    status: 'ALLOCATED',
    firstPickup: 'Indiranagar 100ft Road',
    firstPickupTime: '10:55',
    drop: '*Tech Park Campus (0.00 km)',
    distanceKm: '8.2 km',
    assignedCount: 3,
    totalCapacity: 3,
    assignedCabPlate: 'KA-03-HA-8821',
    assignedDriver: 'Suresh Babu',
    assignedDriverPhone: '+91 98765 43210',
    isBackToBack: true,
    needsMarshal: false,
    hasSpecialNeeds: false,
    passengers: [
      { empCode: 'EMP-9012', name: 'Ananya Deshmukh', pickupNode: '12th Main Indiranagar', pickupTime: '10:55', phone: '+91 98710 44551', pin: '1920' },
      { empCode: 'EMP-9044', name: 'Vikram Seth', pickupNode: 'ESI Hospital Junction', pickupTime: '11:05', phone: '+91 98451 22119', pin: '8832' },
      { empCode: 'EMP-9081', name: 'Deepa Roy', pickupNode: 'Old Airport Road', pickupTime: '11:14', phone: '+91 99001 77221', pin: '4519' },
    ],
  },
  {
    routeId: '3903001',
    status: 'ALLOCATED',
    firstPickup: 'Whitefield ITPL',
    firstPickupTime: '11:15',
    drop: '*Tech Park Campus (0.00 km)',
    distanceKm: '16.8 km',
    assignedCount: 4,
    totalCapacity: 4,
    assignedCabPlate: 'KA-05-MJ-4310',
    assignedDriver: 'Mahesh Gowda',
    assignedDriverPhone: '+91 98450 77112',
    isBackToBack: false,
    needsMarshal: true,
    hasSpecialNeeds: false,
    passengers: [
      { empCode: 'EMP-9102', name: 'Rajesh G.', pickupNode: 'ITPL Main Gate', pickupTime: '11:15', phone: '+91 98860 33412', pin: '7102' },
      { empCode: 'EMP-9114', name: 'Sunita Menon', pickupNode: 'Kundalahalli Gate', pickupTime: '11:25', phone: '+91 97422 11990', pin: '9921' },
      { empCode: 'EMP-9122', name: 'Tanmay Saxena', pickupNode: 'Marathahalli Bridge', pickupTime: '11:34', phone: '+91 99160 55411', pin: '3481' },
      { empCode: 'EMP-9130', name: 'Megha Iyer', pickupNode: 'Devarabisanahalli Outer Ring Rd', pickupTime: '11:42', phone: '+91 98455 88992', pin: '6012' },
    ],
  },
];

const AVAILABLE_CABS = [
  { plate: 'KA-03-HA-8821', model: 'Toyota Innova Crysta', driver: 'Suresh Babu', phone: '+91 98765 43210', capacity: '4 Seater', eta: '1.2 km away from Domlur' },
  { plate: 'KA-05-MJ-4310', model: 'Toyota Innova', driver: 'Mahesh Gowda', phone: '+91 98450 77112', capacity: '4 Seater', eta: '2.8 km away from Domlur' },
  { plate: 'KA-01-EQ-9011', model: 'Force Urbania Tempo', driver: 'Venkatesh R.', phone: '+91 97400 33881', capacity: '12 Seater', eta: 'In Premise Depot (Ready)' },
];

export default function ETSPortal() {
  // Navigation / View State
  const [viewState, setViewState] = useState<ViewState>('login');
  const [loginRole, setLoginRole] = useState<LoginRole>('admin');

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Vendor Dashboard Layout State
  const [activeHeaderTab, setActiveHeaderTab] = useState<'DASHBOARD' | 'ALLOCATE_CABS' | 'BUS_DASHBOARD' | 'ANALYTICS' | 'SETTINGS'>('DASHBOARD');
  const [dashboardMode, setDashboardMode] = useState<'Operations' | 'Cab Allocation'>('Cab Allocation');
  const [rosterSubTab, setRosterSubTab] = useState<'unassigned' | 'assigned'>('assigned');
  
  // LOGIN / LOGOUT direction
  const [tripDirection, setTripDirection] = useState<'LOGIN' | 'LOGOUT'>('LOGIN');
  const [selectedShift, setSelectedShift] = useState<string>('13:30');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('Enterprise Tech Park');
  
  // Search inputs
  const [searchCriteria, setSearchCriteria] = useState<'Employee ID' | 'Name' | 'Phone'>('Employee ID');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [searchVehicleInput, setSearchVehicleInput] = useState('');
  const [searchEmpInput, setSearchEmpInput] = useState('');
  const [searchTripInput, setSearchTripInput] = useState('');
  const [selectedActiveTripId, setSelectedActiveTripId] = useState<string>('ATH-8821');

  // ALLOCATE CABS State
  const [routesList, setRoutesList] = useState<RouteAllocationRecord[]>(INITIAL_ROUTES);
  const [allocateDate, setAllocateDate] = useState('09/11/2026');
  const [allocateOffice, setAllocateOffice] = useState('ALL');
  const [allocateShiftType, setAllocateShiftType] = useState('Login');
  const [allocateShift, setAllocateShift] = useState('All');
  const [allocateSubTab, setAllocateSubTab] = useState<'Pending' | 'Allocated'>('Pending');
  const [allocateSort, setAllocateSort] = useState('Employees');
  const [allocateSortOrder, setAllocateSortOrder] = useState('Desc');
  const [selectedRouteId, setSelectedRouteId] = useState('3902992');

  // Live Location Issue Reassignment Modal
  const [passengerState, setPassengerState] = useState({
    pickupAddress: 'Golden Palms Apts, Indiranagar 100ft Road, Bangalore',
    pickupCoords: { latitude: 12.9719, longitude: 77.6412 },
    isReassigned: false,
    reassignmentReason: '',
  });

  // Settings Sub-Tab Navigation
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('VEHICLE_CONTRACTS');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Switch between LOGIN and LOGOUT
  const handleTripDirectionChange = (dir: 'LOGIN' | 'LOGOUT') => {
    setTripDirection(dir);
    if (dir === 'LOGIN') {
      setSelectedShift('13:30');
    } else {
      setSelectedShift('22:30');
    }
    showToast(`Switched to ${dir === 'LOGIN' ? 'LOGIN (Inward to Campus)' : 'LOGOUT (Outward to Home)'} Commute Window`);
  };

  const handleTabChange = (role: LoginRole) => {
    setLoginRole(role);
    setAuthError(null);
    setIdentifier('');
    setPassword('');
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            if (data.user.role === 'CORPORATE_CLIENT') {
              setViewState('vendor-portal');
            } else if (data.user.role === 'ATHARVA_ADMIN') {
              setViewState('admin-portal');
            }
          }
        }
      } catch (err) {
        console.error('Session verify error:', err);
      }
    }
    checkSession();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!identifier.trim() || !password) {
      setAuthError('Please enter both identifier and password.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          roleTarget: loginRole,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser(data.user);
        showToast(`Authentication verified: Welcome ${data.user.fullName}`);
        if (data.targetPortal === 'admin-portal' || data.user.role === 'ATHARVA_ADMIN') {
          setViewState('admin-portal');
        } else {
          setViewState('vendor-portal');
        }
      } else {
        setAuthError(data.error || 'Invalid credentials. Please verify your alias and password.');
      }
    } catch (err) {
      setAuthError('Connection error: Unable to verify credentials with the authentication service. Please check your network or try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCurrentUser(null);
    setViewState('login');
    showToast('Securely logged out.');
  };

  // Cab Allocation Handler
  const handleAllocateCabToRoute = (routeId: string, cab: typeof AVAILABLE_CABS[0]) => {
    setRoutesList(prev => prev.map(r => {
      if (r.routeId === routeId) {
        return {
          ...r,
          status: 'ALLOCATED',
          assignedCount: r.totalCapacity,
          assignedCabPlate: cab.plate,
          assignedDriver: cab.driver,
          assignedDriverPhone: cab.phone,
        };
      }
      return r;
    }));
    showToast(`✅ Cab ${cab.plate} allocated to Route #${routeId}! Waypoint pushed to Driver ${cab.driver}.`);
  };

  // Cab Deallocation Handler
  const handleDeallocateCabFromRoute = (routeId: string) => {
    setRoutesList(prev => prev.map(r => {
      if (r.routeId === routeId) {
        return {
          ...r,
          status: 'PENDING',
          assignedCount: 0,
          assignedCabPlate: undefined,
          assignedDriver: undefined,
          assignedDriverPhone: undefined,
        };
      }
      return r;
    }));
    showToast(`Cab deallocated from Route #${routeId}. Route returned to Pending Queue.`);
  };

  // Download Tracksheet Action
  const handleDownloadTracksheet = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Route ID,Status,First Pickup,First Pickup Time,Drop Location,Assigned Cab,Driver Name,Driver Phone,Passengers Count\n" +
      routesList.map(r => `"${r.routeId}","${r.status}","${r.firstPickup}","${r.firstPickupTime}","${r.drop}","${r.assignedCabPlate || 'UNASSIGNED'}","${r.assignedDriver || 'N/A'}","${r.assignedDriverPhone || 'N/A'}",${r.totalCapacity}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Atharva_Enterprise_Tracksheet_${allocateDate.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tracksheet CSV exported successfully!');
  };

  const loginShifts = ['08:00', '08:30', '09:00', '09:30', '11:30', '12:00', '13:00', '13:30', '14:00'];
  const logoutShifts = ['16:00', '16:30', '17:00', '17:30', '18:30', '19:30', '21:30', '22:30', '23:30'];
  const currentShifts = tripDirection === 'LOGIN' ? loginShifts : logoutShifts;

  const effectiveEmpQuery = (searchEmployeeQuery || searchEmpInput).trim().toLowerCase();
  const effectiveTripQuery = searchTripInput.trim().toUpperCase();

  const filteredCommuters = COMMUTER_ROSTER.filter((c) => {
    const matchesDirection = c.direction === tripDirection;

    if (effectiveEmpQuery) {
      return (
        c.empCode.toLowerCase().includes(effectiveEmpQuery) ||
        c.name.toLowerCase().includes(effectiveEmpQuery) ||
        c.phone.toLowerCase().includes(effectiveEmpQuery)
      );
    }

    if (effectiveTripQuery) {
      return c.tripId.toUpperCase().includes(effectiveTripQuery);
    }

    const matchesShift = selectedShift ? c.shift === selectedShift : true;
    return matchesDirection && matchesShift;
  });

  const searchedEmployee = effectiveEmpQuery
    ? COMMUTER_ROSTER.find(
        (c) =>
          c.empCode.toLowerCase().includes(effectiveEmpQuery) ||
          c.name.toLowerCase().includes(effectiveEmpQuery)
      )
    : null;

  const searchedTrip = effectiveTripQuery
    ? Object.values(TRIPS_DATA).find((t) => t.tripId.includes(effectiveTripQuery))
    : null;

  const activeTripData = TRIPS_DATA[selectedActiveTripId] || TRIPS_DATA['ATH-8821'];

  // Current active route for Allocate Cabs
  const currentSelectedRoute = routesList.find(r => r.routeId === selectedRouteId) || routesList[0];
  const pendingRoutesCount = routesList.filter(r => r.status === 'PENDING').length;
  const allocatedRoutesCount = 42 + (routesList.filter(r => r.status === 'ALLOCATED').length - 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfe] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-none shadow-2xl border border-slate-700 flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DUAL LOGIN SCREEN (MoveInSync Layout with Atharva Travels Branding)     */}
      {/* ========================================================================= */}
      {viewState === 'login' && (
        <div className="relative flex-1 flex flex-col justify-between min-h-screen overflow-hidden">
          
          <div className="h-10 sm:h-14" />

          <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-6 sm:-mt-8 z-10">
            
            <div className="flex flex-col items-center justify-center mb-6 select-none">
              <img
                src="/logo.png"
                alt="Atharva Travels - Let's Drive Together"
                className="h-24 sm:h-28 max-w-[280px] w-auto object-contain mix-blend-multiply"
              />
            </div>

            <div className="bg-white rounded-none shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-slate-100/80 w-full max-w-[430px] p-8 sm:p-9 transition-all">
              
              {/* DUAL ROLE TAB SWITCHER - ADMIN IS MAIN AUTHORITY */}
              <div className="flex items-center border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('admin')}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold transition-all relative ${
                    loginRole === 'admin'
                      ? 'text-[#0f5fc2]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center justify-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Atharva Admin</span>
                  </span>
                  {loginRole === 'admin' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0f5fc2] rounded-none" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('vendor')}
                  className={`flex-1 pb-3 text-xs sm:text-sm font-bold transition-all relative ${
                    loginRole === 'vendor'
                      ? 'text-[#0f5fc2]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center justify-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Vendor & Team</span>
                  </span>
                  {loginRole === 'vendor' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0f5fc2] rounded-none" />
                  )}
                </button>
              </div>

              {authError && (
                <div className="mb-5 p-3 rounded-none bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{authError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-6">
                
                <div className="border-b border-slate-300 focus-within:border-[#0f5fc2] transition-colors pb-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {loginRole === 'admin' ? 'Super Admin Staff Code / Email' : 'Vendor Alias / Team Staff ID'}
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={loginRole === 'admin' ? 'ATH-ADMIN-01 or admin@atharvatravels.com' : 'vendor.lead@enterprise.internal'}
                    className="w-full text-sm text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none py-1.5 font-normal"
                  />
                </div>

                <div className="border-b border-slate-300 focus-within:border-[#0f5fc2] transition-colors pb-1 relative flex items-center">
                  <div className="w-full">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full text-sm text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none py-1.5 pr-8 font-normal"
                    />
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 bottom-2.5 text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`w-full py-3 rounded-none text-sm font-semibold transition-all duration-200 mt-2 flex items-center justify-center space-x-2 ${
                    identifier && password
                      ? 'bg-[#eceff3] hover:bg-[#0f5fc2] text-[#4b5563] hover:text-white active:scale-[0.99]'
                      : 'bg-[#f1f3f6] text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-none animate-spin" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="text-xs sm:text-sm font-semibold text-[#0f5fc2] hover:underline"
                  >
                    Reset password
                  </button>
                </div>
              </form>
            </div>
          </main>

          {/* Bottom Illustrations */}
          <div className="hidden lg:block absolute bottom-0 left-0 w-80 xl:w-96 pointer-events-none opacity-90 z-0">
            <svg viewBox="0 0 320 180" className="w-full h-auto" fill="none">
              <path d="M10 160C80 155 240 155 310 160" stroke="#e2e8f0" strokeWidth="2.5" />
              <path d="M20 70C60 40 160 30 260 70" stroke="#fbd38d" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M30 145C45 110 85 85 180 85C240 85 270 105 290 145" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M25 152C70 150 250 150 295 152" stroke="#94a3b8" strokeWidth="2.5" />
              <circle cx="85" cy="100" r="13" fill="#fed7aa" stroke="#2d3748" strokeWidth="1.8" />
              <path d="M75 96C75 88 95 88 95 96" fill="#1e293b" />
              <path d="M70 140C70 115 100 115 100 140" fill="#f87171" stroke="#2d3748" strokeWidth="1.8" />
              <circle cx="130" cy="98" r="13" fill="#fed7aa" stroke="#2d3748" strokeWidth="1.8" />
              <path d="M120 94C120 86 140 86 140 94" fill="#0f172a" />
              <path d="M115 140C115 116 145 116 145 140" fill="#38bdf8" stroke="#2d3748" strokeWidth="1.8" />
              <circle cx="180" cy="102" r="13" fill="#fed7aa" stroke="#2d3748" strokeWidth="1.8" />
              <path d="M170 95C170 88 190 88 195 96" fill="#15803d" />
              <path d="M165 140C165 118 195 118 195 140" fill="#4ade80" stroke="#2d3748" strokeWidth="1.8" />
              <rect x="195" cy="115" width="8" height="14" rx="0" fill="#1e293b" />
            </svg>
          </div>

          <div className="hidden lg:block absolute bottom-0 right-0 w-80 xl:w-96 pointer-events-none opacity-90 z-0">
            <svg viewBox="0 0 320 180" className="w-full h-auto" fill="none">
              <path d="M220 20C280 20 300 80 280 150" stroke="#fed7aa" strokeWidth="2" strokeDasharray="3 3" />
              <rect x="70" y="130" width="220" height="40" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
              <line x1="140" y1="135" x2="140" y2="170" stroke="#cbd5e1" strokeWidth="2" />
              <rect x="150" y="140" width="24" height="24" rx="0" stroke="#cbd5e1" strokeWidth="1.8" />
              <circle cx="115" cy="85" r="13" fill="#fed7aa" stroke="#2d3748" strokeWidth="1.8" />
              <path d="M106 82C106 72 124 72 126 84" fill="#0f172a" />
              <path d="M96 130C96 106 134 106 134 130" fill="#fb7185" stroke="#2d3748" strokeWidth="1.8" />
              <path d="M125 130L135 112L155 112L145 130Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
              <line x1="120" y1="130" x2="160" y2="130" stroke="#1e293b" strokeWidth="2" />
              <circle cx="190" cy="78" r="13" fill="#fed7aa" stroke="#2d3748" strokeWidth="1.8" />
              <path d="M180 74C180 64 200 64 202 76" fill="#1e293b" />
              <path d="M172 130C172 100 210 100 210 130" fill="#f97316" stroke="#2d3748" strokeWidth="1.8" />
            </svg>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CORPORATE VENDOR PORTAL (DASHBOARD & ALLOCATE CABS TABS)                */}
      {/* ========================================================================= */}
      {viewState === 'vendor-portal' && (
        <div className="flex-1 flex flex-col bg-[#f4f7fb] text-slate-800">
          
          {/* Vertical Sticky Left Tab: "Contact Support" */}
          <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
            <button
              onClick={() => showToast('Support Hotline: +91 80 6000 8800 • Central Helpdesk Connected')}
              className="bg-[#0f5fc2] hover:bg-blue-700 text-white text-[11px] font-bold py-3 px-1.5 shadow-md flex items-center justify-center [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest transition-colors border-r border-t border-b border-blue-600"
            >
              Contact Support
            </button>
          </div>

          {/* 1. TOP HEADER NAVIGATION BAR */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="max-w-full mx-auto flex items-center justify-between">
              
              {/* Brand + Corporate Hub Name (Faithful to MoveInSync Layout, Zero Walmart) */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <div className="bg-[#107c41] text-white font-extrabold px-1.5 py-0.5 text-xs tracking-tighter flex items-center">
                    <span className="text-base font-black">M</span>
                  </div>
                  <span className="font-extrabold text-[#107c41] text-sm tracking-tight hidden sm:inline">
                    Move<span className="text-slate-800 font-bold">InSync</span>
                  </span>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-slate-800 font-bold text-sm tracking-tight block">
                    Enterprise Tech Park - Bangalore
                  </span>
                </div>
              </div>

              {/* Center Menu Links (DASHBOARD, ALLOCATE CABS, BUS, ANALYTICS, SETTINGS) */}
              <div className="hidden md:flex items-center space-x-1 text-xs font-semibold">
                <button
                  onClick={() => setActiveHeaderTab('DASHBOARD')}
                  className={`px-4 py-1.5 transition-all ${
                    activeHeaderTab === 'DASHBOARD'
                      ? 'bg-[#e8f1fc] text-[#0f5fc2] font-bold border-b-2 border-[#0f5fc2]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  DASHBOARD
                </button>
                <button
                  onClick={() => setActiveHeaderTab('ALLOCATE_CABS')}
                  className={`px-4 py-1.5 transition-all ${
                    activeHeaderTab === 'ALLOCATE_CABS'
                      ? 'bg-[#e8f1fc] text-[#0f5fc2] font-bold border-b-2 border-[#0f5fc2]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ALLOCATE CABS
                </button>
                <button
                  onClick={() => {
                    setActiveHeaderTab('BUS_DASHBOARD');
                    showToast('Bus Shuttle Dashboard: 8 Active Employee Transit Lines');
                  }}
                  className={`px-4 py-1.5 transition-all ${
                    activeHeaderTab === 'BUS_DASHBOARD'
                      ? 'bg-[#e8f1fc] text-[#0f5fc2] font-bold border-b-2 border-[#0f5fc2]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  BUS DASHBOARD
                </button>
                <button
                  onClick={() => {
                    setActiveHeaderTab('ANALYTICS');
                    showToast('Commute SLA Analytics: 99.4% On-Time, Carbon Saved: 182.4 kg');
                  }}
                  className={`px-4 py-1.5 transition-all ${
                    activeHeaderTab === 'ANALYTICS'
                      ? 'bg-[#e8f1fc] text-[#0f5fc2] font-bold border-b-2 border-[#0f5fc2]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  BUSINESS ANALYTICS
                </button>
                {/* SETTINGS MENU WITH MANDATED SUB-SECTIONS */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      setActiveHeaderTab('SETTINGS');
                      showToast('Corporate Settings: Atharva Fleet & Statutory Modules Active');
                    }}
                    className={`px-4 py-1.5 transition-all flex items-center space-x-1 ${
                      activeHeaderTab === 'SETTINGS'
                        ? 'bg-[#e8f1fc] text-[#0f5fc2] font-bold border-b-2 border-[#0f5fc2]'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>SETTINGS</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform" />
                  </button>

                  {/* Dropdown Menu for all 6 Mandated Settings Sections */}
                  <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-300 shadow-xl py-1 w-56 z-50 animate-in fade-in">
                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('VEHICLE_CONTRACTS');
                        showToast('Viewing Vehicle Contracts & Billing Slabs');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'VEHICLE_CONTRACTS'
                          ? 'bg-blue-50 text-[#0f5fc2] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>VEHICLE CONTRACTS</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('MANAGE_NEW_CONTRACTS');
                        showToast('Opening Contract Authoring Wizard');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'MANAGE_NEW_CONTRACTS'
                          ? 'bg-blue-50 text-[#0f5fc2] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>MANAGE NEW CONTRACTS</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('MANAGE_VEHICLES');
                        showToast('Opening Atharva Fleet Master Registry');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'MANAGE_VEHICLES'
                          ? 'bg-blue-50 text-[#0f5fc2] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>MANAGE VEHICLES</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('MANAGE_DRIVERS');
                        showToast('Opening Chauffeur Roster & Police BVC Desk');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'MANAGE_DRIVERS'
                          ? 'bg-blue-50 text-[#0f5fc2] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>MANAGE DRIVERS</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('MANAGE_COMPLIANCE');
                        showToast('Opening Statutory Compliance Audit Dashboard');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'MANAGE_COMPLIANCE'
                          ? 'bg-blue-50 text-[#0f5fc2] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>MANAGE COMPLIANCE</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('MANAGE_FIXED_DEVICES');
                        showToast('Opening AIS-140 GPS & Fixed IoT Devices');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'MANAGE_FIXED_DEVICES'
                          ? 'bg-blue-50 text-[#0f5fc2] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>MANAGE FIXED DEVICES</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveHeaderTab('SETTINGS');
                        setSettingsSubTab('MANAGE_VENDOR_ACCESS');
                        showToast('Opening Super Admin Access & Vendor Teams Console');
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-amber-50 hover:text-amber-950 flex items-center justify-between transition-colors ${
                        activeHeaderTab === 'SETTINGS' && settingsSubTab === 'MANAGE_VENDOR_ACCESS'
                          ? 'bg-amber-100 text-amber-950 font-bold'
                          : 'text-amber-800'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <KeyRound className="w-3 h-3 text-amber-600" />
                        <span>ACCESS & VENDOR TEAMS</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-amber-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right User & Utility Controls */}
              <div className="flex items-center space-x-3">
                <div className="relative cursor-pointer">
                  <div className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-700">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1 leading-tight">
                    NEW
                  </span>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div className="w-8 h-8 bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs" title="Authorized Mobility User">
                  <User className="w-4 h-4" />
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD VIEW (From previous screenshot)                           */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'DASHBOARD' && (
            <div className="flex-1 flex flex-col">
              
              {/* Timeline Slider & Shift Direction Switcher */}
              <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-4 flex-1 min-w-[340px] max-w-2xl">
                  <span className="font-semibold text-slate-700 shrink-0 text-[11px]">
                    {tripDirection === 'LOGIN' ? '09 Nov 2026 08:00 - 09 Nov 2026 14:00 (LOGIN)' : '09 Nov 2026 16:00 - 09 Nov 2026 23:30 (LOGOUT)'}
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <div className="h-1 bg-blue-200 w-full" />
                    <div className="absolute left-[15%] w-3.5 h-3.5 bg-[#0f5fc2] cursor-pointer shadow-sm" />
                    <div className="absolute left-[65%] w-3.5 h-3.5 bg-[#0f5fc2] cursor-pointer shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-slate-300 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleTripDirectionChange('LOGIN')}
                      className={`px-3 py-1 text-xs font-bold transition-all ${
                        tripDirection === 'LOGIN' ? 'bg-[#0f5fc2] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      LOGIN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTripDirectionChange('LOGOUT')}
                      className={`px-3 py-1 text-xs font-bold transition-all ${
                        tripDirection === 'LOGOUT' ? 'bg-[#0f5fc2] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      LOGOUT
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedBusinessUnit}
                      onChange={(e) => setSelectedBusinessUnit(e.target.value)}
                      className="bg-white border border-slate-300 px-3 py-1.5 pr-7 font-semibold text-slate-700 appearance-none focus:outline-none focus:border-blue-600 text-xs min-w-[160px]"
                    >
                      <option value="Enterprise Tech Park">Enterprise Tech Park</option>
                      <option value="Corporate Central Hub">Corporate Central Hub</option>
                      <option value="Bellandur Tech Corridor">Bellandur Tech Corridor</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    onClick={() => showToast(`Synchronized ${tripDirection} commute rosters with Atharva central fleet database.`)}
                    className="w-7 h-7 bg-[#0fa958] hover:bg-emerald-600 text-white flex items-center justify-center shadow-sm transition-colors"
                    title="Refresh Roster"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Time Shift Pills */}
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center space-x-2 overflow-x-auto text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  {tripDirection} Shifts:
                </span>
                {currentShifts.map((shiftTime) => (
                  <button
                    key={shiftTime}
                    onClick={() => setSelectedShift(shiftTime)}
                    className={`px-3 py-1 border text-xs font-semibold transition-all ${
                      selectedShift === shiftTime
                        ? 'border-[#0f5fc2] text-[#0f5fc2] bg-blue-50/60 font-bold'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {shiftTime}
                  </button>
                ))}

                <div className="relative pl-1">
                  <button className="px-3 py-1 border border-slate-300 bg-white text-slate-600 hover:border-slate-400 flex items-center space-x-1.5 text-xs font-medium">
                    <span>All Shifts</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Main Split Stage */}
              <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* Left 8 Cols: Roster / Google Maps */}
                <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm flex flex-col min-h-[580px]">
                  
                  <div className="border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 bg-white">
                    <div className="flex items-center space-x-6 text-xs">
                      <button
                        onClick={() => setRosterSubTab('unassigned')}
                        className={`pb-2 pt-1 font-bold flex items-center space-x-1.5 relative ${
                          rosterSubTab === 'unassigned' ? 'text-[#0f5fc2] border-b-2 border-[#0f5fc2] -mb-[9px]' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5 text-[#0f5fc2]" />
                        <span>Unassigned</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 font-semibold ml-1">0</span>
                      </button>

                      <button
                        onClick={() => setRosterSubTab('assigned')}
                        className={`pb-2 pt-1 font-bold flex items-center space-x-1.5 relative ${
                          rosterSubTab === 'assigned' ? 'text-[#0f5fc2] border-b-2 border-[#0f5fc2] -mb-[9px]' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assigned</span>
                        <span className="text-[10px] bg-blue-100 text-[#0f5fc2] px-1 py-0.2 font-semibold ml-1">
                          {filteredCommuters.length}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <div className="relative">
                        <select
                          value={searchCriteria}
                          onChange={(e) => setSearchCriteria(e.target.value as any)}
                          className="border border-slate-300 bg-white py-1 pl-2 pr-6 text-xs font-semibold text-slate-600 appearance-none focus:outline-none"
                        >
                          <option value="Employee ID">Employee ID</option>
                          <option value="Name">Name</option>
                          <option value="Phone">Phone</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={searchEmployeeQuery}
                          onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                          placeholder="Search by Employee ID (e.g. 9042)"
                          className="border border-slate-300 py-1 pl-7 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 w-52"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      </div>

                      {searchEmployeeQuery && (
                        <button onClick={() => setSearchEmployeeQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button className="p-1 text-slate-400 hover:text-slate-600">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col p-6 items-center justify-center relative">
                    {rosterSubTab === 'unassigned' ? (
                      <div className="flex flex-col items-center justify-center py-10 w-full max-w-xl text-center select-none">
                        <svg viewBox="0 0 460 260" className="w-full max-w-md h-auto" fill="none">
                          <line x1="80" y1="230" x2="380" y2="230" stroke="#334155" strokeWidth="1.5" />
                          <rect x="130" y="50" width="200" height="130" stroke="#1e293b" strokeWidth="2" fill="#ffffff" />
                          <line x1="130" y1="62" x2="330" y2="62" stroke="#e2e8f0" strokeWidth="1" />
                          <rect x="210" y="180" width="40" height="30" stroke="#1e293b" strokeWidth="1.5" fill="#f8fafc" />
                          <path d="M195 210H265" stroke="#1e293b" strokeWidth="2" />
                          <path d="M220 90C220 78 238 78 238 90C238 102 226 106 226 116" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
                          <circle cx="226" cy="130" r="3" fill="#94a3b8" />
                          <circle cx="205" cy="80" r="1.5" fill="#1e293b" />
                          <circle cx="250" cy="115" r="1.5" fill="#1e293b" />
                          <circle cx="135" cy="85" r="10" stroke="#1e293b" strokeWidth="1.5" fill="#fed7aa" />
                          <path d="M128 85C125 75 142 75 142 85" fill="#0f172a" />
                          <path d="M125 105L115 185H145L140 105Z" stroke="#1e293b" strokeWidth="1.5" fill="#ffffff" />
                          <circle cx="320" cy="90" r="10" stroke="#1e293b" strokeWidth="1.5" fill="#fed7aa" />
                          <path d="M312 88C312 78 330 78 330 88" fill="#1e293b" />
                          <path d="M308 108L305 150H335L332 108Z" stroke="#1e293b" strokeWidth="1.5" fill="#ffffff" />
                          <path d="M305 150L300 230H315L320 170L325 230H338L335 150Z" stroke="#1e293b" strokeWidth="1.5" fill="#ffffff" />
                          <path d="M308 115L275 125" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <p className="text-xs text-slate-500 font-semibold mt-4">
                          No unassigned employees for {tripDirection} shift <strong className="text-slate-800">{selectedShift}</strong>.
                        </p>
                        <button
                          onClick={() => setRosterSubTab('assigned')}
                          className="mt-4 px-4 py-1.5 bg-[#0f5fc2] hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                        >
                          View Assigned Cabs ({filteredCommuters.length} Commuters)
                        </button>
                      </div>
                    ) : (
                      <div className="w-full space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Navigation className="w-3.5 h-3.5 text-[#0f5fc2]" />
                              <h4 className="font-bold text-xs text-slate-800">
                                Live Route Telemetry: {activeTripData.tripId} ({activeTripData.vehiclePlate})
                              </h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 ${
                                tripDirection === 'LOGIN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {tripDirection}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">{activeTripData.route}</span>
                          </div>

                          <GoogleMapsTracker
                            pickupCoords={{ latitude: activeTripData.currentLat, longitude: activeTripData.currentLng }}
                            pickupAddress={passengerState.pickupAddress}
                            driverCoords={{ latitude: activeTripData.currentLat, longitude: activeTripData.currentLng }}
                            vehiclePlate={activeTripData.vehiclePlate}
                            driverName={activeTripData.driverName}
                            onPickupReassigned={(newCoords, address) => {
                              showToast('Pickup node updated and pushed to Driver app!');
                            }}
                          />
                        </div>

                        <div className="border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 px-3">Employee ID & Name</th>
                                <th className="py-2.5 px-3">Trip ID</th>
                                <th className="py-2.5 px-3">{tripDirection === 'LOGIN' ? 'Pickup Point' : 'Drop Point'}</th>
                                <th className="py-2.5 px-3">Assigned Cab</th>
                                <th className="py-2.5 px-3">Boarding PIN</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredCommuters.length > 0 ? (
                                filteredCommuters.map((commuter) => (
                                  <tr key={commuter.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="font-mono text-blue-700 font-bold">{commuter.empCode}</span>
                                        <span>•</span>
                                        <span>{commuter.name}</span>
                                      </div>
                                      <span className="text-slate-400 font-normal text-[11px] block">{commuter.department}</span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                      <button
                                        onClick={() => {
                                          setSelectedActiveTripId(commuter.tripId);
                                          setSearchTripInput(commuter.tripId);
                                          showToast(`Selected Trip #${commuter.tripId} for live tracking`);
                                        }}
                                        className="hover:text-blue-600 hover:underline"
                                      >
                                        #{commuter.tripId}
                                      </button>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                      {commuter.address}
                                      {commuter.hasEscortGuard && (
                                        <span className="block text-[10px] text-purple-700 font-semibold mt-0.5">
                                          🛡️ Escort: {commuter.escortGuardName}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                                      <div>{commuter.vehiclePlate}</div>
                                      <span className="text-slate-400 text-[11px] font-normal block">{commuter.driverName}</span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{commuter.boardingOtp}</td>
                                    <td className="py-2.5 px-3">
                                      {commuter.status === 'BOARDED' ? (
                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">Boarded ✓</span>
                                      ) : (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 font-bold text-[10px]">{commuter.eta}</span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button onClick={() => setIsLocationModalOpen(true)} className="text-[#0f5fc2] hover:underline font-bold text-xs">
                                        Update Node
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="py-6 text-center text-xs text-slate-400">
                                    No commuters found matching criteria.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 4 Cols: Search Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Dashboard mode:</span>
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <span className={dashboardMode === 'Operations' ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>Operations</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = dashboardMode === 'Operations' ? 'Cab Allocation' : 'Operations';
                          setDashboardMode(next);
                          if (next === 'Operations') setRosterSubTab('assigned');
                        }}
                        className={`w-11 h-6 p-0.5 border transition-colors relative ${
                          dashboardMode === 'Cab Allocation' ? 'bg-[#0f5fc2] border-[#0f5fc2]' : 'bg-slate-300 border-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white shadow-sm transition-transform ${dashboardMode === 'Cab Allocation' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <span className={dashboardMode === 'Cab Allocation' ? 'text-[#0f5fc2] font-bold' : 'text-slate-400 font-normal'}>Cab Allocation</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 shadow-sm space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Search</h3>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Employee ID / Name (CTRL + E)</span>
                        {searchEmpInput && <button onClick={() => setSearchEmpInput('')} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchEmpInput}
                          onChange={(e) => setSearchEmpInput(e.target.value)}
                          placeholder="e.g. EMP-9042, 9018, Priya"
                          className="w-full border border-slate-300 py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Trip ID / Vehicle (ALT + T)</span>
                        {searchTripInput && <button onClick={() => setSearchTripInput('')} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTripInput}
                          onChange={(e) => setSearchTripInput(e.target.value)}
                          placeholder="e.g. ATH-8821, ATH-4310"
                          className="w-full border border-slate-300 py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono font-medium"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Vehicle Plate (ALT + Q)</span>
                        {searchVehicleInput && <button onClick={() => setSearchVehicleInput('')} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchVehicleInput}
                          onChange={(e) => setSearchVehicleInput(e.target.value)}
                          placeholder="e.g. KA-03-HA-8821"
                          className="w-full border border-slate-300 py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono text-xs"
                        />
                        <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {searchedEmployee && (
                    <div className="bg-white border-2 border-[#0f5fc2] p-4 shadow-md space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-[#0f5fc2]" />
                          <span className="font-bold text-xs text-slate-900">{searchedEmployee.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold bg-blue-100 text-[#0f5fc2] px-1.5 py-0.5">{searchedEmployee.empCode}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Commute Mode</span>
                          <span className="font-bold text-slate-800">{searchedEmployee.direction} ({searchedEmployee.shift})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Boarding PIN</span>
                          <span className="font-mono font-black text-blue-700 text-sm">{searchedEmployee.boardingOtp}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Trip & Cab</span>
                          <span className="font-bold text-slate-800">#{searchedEmployee.tripId} • {searchedEmployee.vehiclePlate}</span>
                          <span className="block text-slate-500 text-[11px]">Driver: {searchedEmployee.driverName} ({searchedEmployee.driverPhone})</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location Node</span>
                          <p className="text-slate-700 text-xs truncate">{searchedEmployee.address}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsLocationModalOpen(true)} className="w-full bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold py-2 text-xs transition-colors flex items-center justify-center space-x-1.5">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Reassign Geolocation Node</span>
                      </button>
                    </div>
                  )}

                  {searchedTrip && (
                    <div className="bg-white border-2 border-emerald-600 p-4 shadow-md space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-slate-900">Trip #{searchedTrip.tripId}</span>
                        </div>
                        <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5">{searchedTrip.vehiclePlate}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-semibold">Driver</span>
                          <span className="font-semibold text-slate-800">{searchedTrip.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-semibold">Telemetry</span>
                          <span className="font-bold text-emerald-700">{searchedTrip.speed} • {searchedTrip.eta}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedActiveTripId(searchedTrip.tripId);
                          setRosterSubTab('assigned');
                          showToast(`Tracking Trip #${searchedTrip.tripId} on Google Maps radar`);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs text-center"
                      >
                        Track on Map
                      </button>
                    </div>
                  )}

                  <div className="bg-[#f0f6ff] border border-blue-200 p-3 shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-500 text-base">📢</span>
                      <span className="text-slate-700 font-semibold">A whole <strong className="text-slate-900">new</strong> landing experience!</span>
                    </div>
                    <button onClick={() => showToast('Smart Roster Optimization v26.01 Active')} className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1 text-xs">
                      Know More
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ALLOCATE CABS VIEW (Exact Replica from Uploaded Screenshot)          */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'ALLOCATE_CABS' && (
            <div className="flex-1 flex flex-col bg-[#f4f7fb]">
              
              {/* 1. TOP ALLOCATION FILTER ROW & METRICS TABLE */}
              <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                
                {/* Left Form Filters: Date, Offices, ShiftType, Shifts */}
                <div className="flex items-center space-x-6 flex-wrap gap-y-2">
                  
                  {/* Date Input with Calendar Icon */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-600">Date</span>
                    <div className="flex items-center border border-slate-300 px-2.5 py-1 bg-white">
                      <input
                        type="text"
                        value={allocateDate}
                        onChange={(e) => setAllocateDate(e.target.value)}
                        className="w-24 text-xs focus:outline-none text-slate-800 font-medium"
                      />
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>

                  {/* Offices Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-600">Offices</span>
                    <div className="relative">
                      <select
                        value={allocateOffice}
                        onChange={(e) => setAllocateOffice(e.target.value)}
                        className="border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-800 appearance-none focus:outline-none min-w-[130px]"
                      >
                        <option value="ALL">ALL</option>
                        <option value="Enterprise Tech Park">Enterprise Tech Park</option>
                        <option value="Main Campus Terminal">Main Campus Terminal</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* ShiftType Dropdown (Login / Logout) */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-600">ShiftType</span>
                    <div className="relative">
                      <select
                        value={allocateShiftType}
                        onChange={(e) => setAllocateShiftType(e.target.value)}
                        className="border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-800 appearance-none focus:outline-none min-w-[110px]"
                      >
                        <option value="Login">Login</option>
                        <option value="Logout">Logout</option>
                        <option value="Both">Both</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Shifts Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-600">Shifts</span>
                    <div className="relative">
                      <select
                        value={allocateShift}
                        onChange={(e) => setAllocateShift(e.target.value)}
                        className="border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-800 appearance-none focus:outline-none min-w-[100px]"
                      >
                        <option value="All">All</option>
                        <option value="10:30">10:30</option>
                        <option value="10:43">10:43</option>
                        <option value="11:30">11:30</option>
                        <option value="13:30">13:30</option>
                        <option value="22:30">22:30</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* Right Summary KPI Metrics Table (Green Headers) */}
                <div className="border border-slate-200 overflow-hidden shadow-sm">
                  <table className="text-center text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-3.5 py-1 text-emerald-700 font-bold bg-white text-[11px]">Total Routes</th>
                        <th className="px-3.5 py-1 text-emerald-700 font-bold bg-white text-[11px] border-l border-slate-200">Vehicle Allocated</th>
                        <th className="px-3.5 py-1 text-emerald-700 font-bold bg-white text-[11px] border-l border-slate-200">Vehicle Allocation Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-extrabold text-sm text-slate-800 bg-white">
                        <td className="py-1">43</td>
                        <td className="py-1 border-l border-slate-200 text-emerald-700">{allocatedRoutesCount}</td>
                        <td className="py-1 border-l border-slate-200 text-amber-600">{pendingRoutesCount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* 2. SUB-BAR: PENDING / ALLOCATED TABS & DOWNLOAD TRACKSHEET */}
              <div className="bg-[#b3c2ce] px-6 py-1 flex items-center justify-between text-xs">
                
                {/* Tabs: Pending vs Allocated */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setAllocateSubTab('Pending')}
                    className={`px-5 py-2 font-bold text-xs uppercase transition-all ${
                      allocateSubTab === 'Pending'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-transparent text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    onClick={() => setAllocateSubTab('Allocated')}
                    className={`px-5 py-2 font-bold text-xs uppercase transition-all ${
                      allocateSubTab === 'Allocated'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-transparent text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Allocated
                  </button>
                </div>

                {/* Download Tracksheet Link */}
                <button
                  onClick={handleDownloadTracksheet}
                  className="text-[#0f5fc2] hover:text-blue-900 font-bold text-xs hover:underline flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tracksheet</span>
                </button>

              </div>

              {/* 3. SORT CONTROLS BAR */}
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center space-x-2 text-xs">
                <span className="font-medium text-slate-600">Sort:</span>
                <div className="relative">
                  <select
                    value={allocateSort}
                    onChange={(e) => setAllocateSort(e.target.value)}
                    className="border border-slate-300 bg-white py-0.5 pl-2 pr-6 text-xs text-slate-800 appearance-none focus:outline-none"
                  >
                    <option value="Employees">Employees</option>
                    <option value="Pickup Time">Pickup Time</option>
                    <option value="Route Id">Route Id</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={allocateSortOrder}
                    onChange={(e) => setAllocateSortOrder(e.target.value)}
                    className="border border-slate-300 bg-white py-0.5 pl-2 pr-6 text-xs text-slate-800 appearance-none focus:outline-none"
                  >
                    <option value="Desc">Desc</option>
                    <option value="Asc">Asc</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => showToast('Sorted routes by ' + allocateSort + ' (' + allocateSortOrder + ')')}
                  className="border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-0.5 text-xs font-bold text-slate-700"
                >
                  GO
                </button>
              </div>

              {/* 4. THREE-COLUMN ALLOCATION STAGE */}
              <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: ROUTE CARDS (Left 3 cols) */}
                <div className="lg:col-span-3 space-y-3">
                  {routesList
                    .filter(r => allocateSubTab === 'Pending' ? r.status === 'PENDING' : r.status === 'ALLOCATED')
                    .map((route) => (
                      <div
                        key={route.routeId}
                        onClick={() => setSelectedRouteId(route.routeId)}
                        className={`border p-4 shadow-sm cursor-pointer transition-all ${
                          selectedRouteId === route.routeId
                            ? 'border-[#0f5fc2] bg-white ring-1 ring-[#0f5fc2]'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-100">
                          <span>Route Id: {route.routeId}({route.assignedCount}/{route.totalCapacity})</span>
                          {route.status === 'ALLOCATED' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold">Allocated</span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold">Pending</span>
                          )}
                        </div>

                        <div className="pt-2 space-y-1 text-xs">
                          <div>
                            <span className="font-bold text-slate-900">First Pickup : </span>
                            <span className="text-slate-700">{route.firstPickup}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">First Pickup Time : </span>
                            <span className="text-slate-800 font-bold">{route.firstPickupTime}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 pt-0.5">
                            Drop : {route.drop}
                          </div>

                          {route.assignedCabPlate && (
                            <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-800">
                              Cab: {route.assignedCabPlate} ({route.assignedDriver})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {routesList.filter(r => allocateSubTab === 'Pending' ? r.status === 'PENDING' : r.status === 'ALLOCATED').length === 0 && (
                    <div className="p-8 border border-slate-200 bg-white text-center text-xs text-slate-400">
                      No routes in {allocateSubTab} queue.
                    </div>
                  )}
                </div>

                {/* COLUMN 2: SELECTED ROUTE PASSENGERS & STOPS (Middle 5 cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm p-5 space-y-4 min-h-[460px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Route Manifest: #{currentSelectedRoute.routeId}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {currentSelectedRoute.firstPickup} ➔ {currentSelectedRoute.drop} • {currentSelectedRoute.distanceKm}
                      </span>
                    </div>
                    <span className="bg-blue-100 text-[#0f5fc2] text-xs font-bold px-2 py-0.5">
                      {currentSelectedRoute.passengers.length} Employees Rostered
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentSelectedRoute.passengers.map((p, idx) => (
                      <div key={p.empCode} className="border border-slate-200 p-3 bg-slate-50/50 flex items-start justify-between text-xs">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-[#0f5fc2] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.name} ({p.empCode})</div>
                            <div className="text-slate-600 text-[11px] mt-0.5 flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{p.pickupNode}</span>
                            </div>
                            <span className="text-slate-400 text-[10px] block mt-0.5">
                              Pickup Time: <strong>{p.pickupTime}</strong> • Contact: {p.phone}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 text-xs block">
                            PIN: {p.pin}
                          </span>
                          <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="text-[#0f5fc2] hover:underline font-bold text-[10px] mt-2 block"
                          >
                            Reassign Node
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentSelectedRoute.assignedCabPlate && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 block text-xs">✓ Vehicle Allocated</span>
                        <button
                          onClick={() => handleDeallocateCabFromRoute(currentSelectedRoute.routeId)}
                          className="text-red-600 hover:text-red-800 font-bold text-[11px] hover:underline"
                        >
                          Deallocate / Re-assign
                        </button>
                      </div>
                      <p className="text-slate-700">
                        Cab Plate: <strong>{currentSelectedRoute.assignedCabPlate}</strong> • Driver: <strong>{currentSelectedRoute.assignedDriver}</strong>
                      </p>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Driver notification dispatched & trip lock confirmed.
                      </span>
                    </div>
                  )}
                </div>

                {/* COLUMN 3: CABS AVAILABLE FOR ALLOCATION (Right 4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm p-5 space-y-4 min-h-[460px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Cabs</h3>
                    <span className="text-xs text-slate-400">Available Fleet Near Zone</span>
                  </div>

                  <div className="space-y-3">
                    {AVAILABLE_CABS.map((cab) => (
                      <div key={cab.plate} className="border border-slate-200 p-3.5 hover:border-blue-400 transition-colors bg-white space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 text-sm">{cab.plate}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                            {cab.capacity}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600">
                          <div>{cab.model} • Driver: <strong className="text-slate-800">{cab.driver}</strong></div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                            <Navigation className="w-3 h-3 text-blue-600" />
                            <span>{cab.eta}</span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center space-x-2">
                          <button
                            onClick={() => handleAllocateCabToRoute(currentSelectedRoute.routeId, cab)}
                            className="flex-1 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold py-1.5 text-xs transition-colors shadow-sm"
                          >
                            Allocate Cab
                          </button>
                          <a
                            href={`tel:${cab.phone}`}
                            className="p-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100"
                            title="Call Driver"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Opening Atharva Master Fleet Live Radar...')}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 border border-slate-300 text-center"
                    >
                      View All 42 Depoted Fleet Vehicles
                    </button>
                  </div>
                </div>

              </div>

              {/* 5. BOTTOM LEGEND ROW (Exact reproduction from Screenshot) */}
              <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-600 select-none">
                <div className="flex flex-wrap items-center space-x-6">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Marshal Required</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Back to Back trips</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Marshal Required in Paired Back to Back trip</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trips with special need employees</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-[#0f5fc2]">
                  <button onClick={() => showToast('Network Latency: 16ms (Bangalore Node)')} className="hover:underline">
                    Check Latency
                  </button>
                  <span className="text-slate-300">•</span>
                  <button onClick={() => showToast('Network Timing: TTFB 22ms, Ready 84ms')} className="hover:underline">
                    Network Timing
                  </button>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-mono">Version : 26.01.17</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SETTINGS VIEW (Mandated: Contracts, Vehicles, Drivers, Compliance) */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'SETTINGS' && (
            <SettingsModule
              initialSubTab={settingsSubTab}
              onSubTabChange={(tab) => setSettingsSubTab(tab)}
              showToast={showToast}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BUS DASHBOARD VIEW (Shuttle & Mass Transit Lines)                  */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'BUS_DASHBOARD' && (
            <div className="flex-1 flex flex-col bg-[#f4f7fb] p-6 space-y-6">
              <div className="bg-white border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#0f5fc2]">
                      MASS TRANSIT & SHUTTLE DISPATCH
                    </span>
                    <span className="bg-blue-100 text-[#0f5fc2] text-[10px] font-bold px-2 py-0.5">
                      8 FIXED CORRIDORS
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Bengaluru High-Capacity Corporate Bus & Tempo Corridors
                  </h2>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
                    Active Transporter: <strong>Atharva Travels Shuttle Fleet</strong>
                  </span>
                  <button
                    onClick={() => showToast('Bus telemetry synchronized with Bangalore traffic nodes!')}
                    className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Radar</span>
                  </button>
                </div>
              </div>

              {/* BUS SHUTTLE CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { routeNo: 'SH-01', from: 'Whitefield TTMC', to: 'Tech Park Campus', occupancy: '28 / 32 Seated', driver: 'Nagaraj K.', plate: 'KA-04-E-6620', eta: 'On Time (12m)' },
                  { routeNo: 'SH-02', from: 'Indiranagar Metro', to: 'Tech Park Campus', occupancy: '18 / 20 Seated', driver: 'Basavaraj M.', plate: 'KA-05-NB-9044', eta: 'On Time (8m)' },
                  { routeNo: 'SH-03', from: 'Koramangala Sony World', to: 'Tech Park Campus', occupancy: '22 / 24 Seated', driver: 'Muniswamy R.', plate: 'KA-01-EQ-9011', eta: '+3m Delay' },
                  { routeNo: 'SH-04', from: 'Electronic City Toll', to: 'Tech Park Campus', occupancy: '30 / 32 Seated', driver: 'Girish Patil', plate: 'KA-53-B-7712', eta: 'On Time (15m)' },
                ].map((shuttle) => (
                  <div key={shuttle.routeNo} className="bg-white border border-slate-200 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#0f5fc2] text-white font-black text-xs px-2 py-0.5">
                        ROUTE {shuttle.routeNo}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        {shuttle.eta}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900">{shuttle.from} ➔ {shuttle.to}</div>
                      <div className="text-slate-500 text-[11px]">Vehicle: <strong className="text-slate-700">{shuttle.plate}</strong></div>
                      <div className="text-slate-500 text-[11px]">Chauffeur: {shuttle.driver}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Capacity:</span>
                      <span className="font-bold text-[#0f5fc2]">{shuttle.occupancy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: BUSINESS ANALYTICS VIEW                                            */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'ANALYTICS' && (
            <div className="flex-1 flex flex-col bg-[#f4f7fb] p-6 space-y-6">
              <div className="bg-white border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#0f5fc2] block">
                    COMMUTE SLA & ESG ANALYTICS
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Enterprise Bengaluru Commute Intelligence
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="bg-slate-100 border border-slate-300 px-3 py-1.5 font-bold text-slate-700">
                    Reporting Window: Nov 2026
                  </span>
                  <button
                    onClick={() => showToast('Exporting executive SLA & ESG compliance report (PDF)...')}
                    className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    On-Time Commute SLA
                  </span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">99.4%</div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    Above 98.0% Contract Target
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Passenger Trips
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">1,842</div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Login: 924 • Logout: 918
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Carbon Saved (ESG Metric)
                  </span>
                  <div className="text-3xl font-black text-[#0f5fc2] mt-1">182.4 kg</div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Via Route Pooling & EV Fleet
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Zero Safety Incidents
                  </span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">100% Safe</div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    480 Consecutive Accident-Free Days
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. BOTTOM STATUS FOOTER BAR */}
          <footer className="bg-white border-t border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => showToast('9 cabs in premise depot (KA-03-HA-8821, KA-05-MJ-4310, etc.)')}
                className="border border-slate-300 hover:border-blue-500 px-3 py-1 text-slate-700 font-semibold text-xs flex items-center space-x-2 transition-colors bg-white"
              >
                <span>In premise vehicles</span>
                <span className="w-4 h-4 bg-[#0f5fc2] text-white flex items-center justify-center text-[10px] font-bold">9</span>
              </button>

              <button
                onClick={() => showToast('No adhoc emergency trips active for this window.')}
                className="border border-slate-300 hover:border-blue-500 px-3 py-1 text-slate-700 font-semibold text-xs flex items-center space-x-2 transition-colors bg-white"
              >
                <span>Adhoc trips</span>
                <span className="w-4 h-4 bg-[#0f5fc2] text-white flex items-center justify-center text-[10px] font-bold">0</span>
              </button>

              <button
                onClick={() => showToast('All active fleet vehicles running on-time (99.4% SLA)')}
                className="border border-slate-300 hover:border-blue-500 px-3 py-1 text-slate-700 font-semibold text-xs flex items-center space-x-2 transition-colors bg-white"
              >
                <span>Delayed Vehicles</span>
                <span className="w-4 h-4 bg-[#0f5fc2] text-white flex items-center justify-center text-[10px] font-bold">0</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-[#0f5fc2]">
              <button onClick={() => showToast('Network Latency: 18ms (Bengaluru Data Center)')} className="hover:underline">
                Check Latency
              </button>
              <span className="text-slate-300">•</span>
              <button onClick={() => showToast('Network Timing: TTFB 24ms, DOM ready 88ms')} className="hover:underline">
                Network Timing
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Version : 26.01.47</span>
            </div>
          </footer>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ATHARVA TRAVELS ADMIN COMMAND PORTAL (LIGHT BACKGROUND THEME)          */}
      {/* ========================================================================= */}
      {viewState === 'admin-portal' && (
        <div className="flex-1 flex flex-col bg-[#f4f7fb] text-slate-800 font-sans">
          
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-2.5 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              
              <div className="flex items-center space-x-4">
                <img
                  src="/logo.png"
                  alt="Atharva Travels"
                  className="h-8 w-auto object-contain mix-blend-multiply"
                />
                <div className="border-l border-slate-200 pl-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-slate-900 tracking-tight">CENTRAL OPERATIONS COMMAND</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 uppercase">
                      Super Admin Main
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Operator: <strong>ATH-ADMIN-01</strong> • Bengaluru Central Fleet Command & Vendor Access Control
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <button
                  onClick={() => {
                    setViewState('vendor-portal');
                    setActiveHeaderTab('SETTINGS');
                    setSettingsSubTab('MANAGE_VENDOR_ACCESS');
                    showToast('Opening Super Admin Access & Vendor Teams Console');
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Manage Vendors & Teams</span>
                </button>

                <button
                  onClick={() => {
                    setViewState('vendor-portal');
                    setActiveHeaderTab('DASHBOARD');
                    showToast('Switched to Enterprise Transport System Portal View');
                  }}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Full Portal View</span>
                </button>

                <div className="h-6 w-px bg-slate-200" />

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          <main className="max-w-7xl mx-auto w-full p-6 space-y-6 flex-1">
            
            {/* HERO BAR (LIGHT BG) */}
            <div className="bg-white border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-amber-700 font-extrabold text-[11px] uppercase tracking-wider block">
                  SUPER ADMIN CENTRAL TELEMETRY & DISPATCH OPERATIONS
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                  Atharva Fleet Telemetry & Safety Command
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Central authority radar monitoring 42 deployed cabs, statutory escort safety, and vendor team authorizations.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold px-3.5 py-2 transition-colors flex items-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Push Geolocation Waypoint</span>
                </button>

                <button
                  onClick={() => {
                    setIsSosActive(!isSosActive);
                    showToast(isSosActive ? 'SOS Alert marked as Resolved' : 'Emergency SOS Alert Broadcasted to Operations Desk');
                  }}
                  className={`font-bold px-4 py-2 flex items-center space-x-2 transition-all shadow-sm ${
                    isSosActive
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>{isSosActive ? '🚨 Active SOS Incident (Click to Resolve)' : 'Simulate Emergency SOS Alert'}</span>
                </button>
              </div>
            </div>

            {/* EMERGENCY SOS BANNER (IF ACTIVE) */}
            {isSosActive && (
              <div className="bg-red-50 border-2 border-red-500 p-5 shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-600 text-white p-3 animate-bounce">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-red-950 tracking-wide">
                      CRITICAL: EMERGENCY SOS BROADCAST RECEIVED!
                    </h4>
                    <p className="text-xs text-red-900 mt-1">
                      Employee: <strong>Amrutha Rao</strong> (Enterprise Tech Client) • Vehicle: <strong>KA-03-HA-8821</strong>
                      <br />
                      GPS Beacon: <strong>12.9716° N, 77.5946° E</strong> (Indiranagar 100ft Road).
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => showToast('🚓 Quick Response Team (QRT) Dispatched with Police Siren Beacon!')}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 shadow-sm transition-colors"
                  >
                    Dispatch QRT Immediately
                  </button>
                  <button
                    onClick={() => setIsSosActive(false)}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-2.5"
                  >
                    Clear Alarm
                  </button>
                </div>
              </div>
            )}

            {/* RADAR MAP TRACKER (LIGHT BG CONTAINER) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Atharva Fleet Live Telemetry Radar (Bangalore Central Zone)</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">42 Vehicles Operating in Real-Time</span>
              </div>

              <div className="overflow-hidden border border-slate-200 shadow-sm bg-white">
                <GoogleMapsTracker
                  pickupCoords={{ latitude: activeTripData.currentLat, longitude: activeTripData.currentLng }}
                  pickupAddress={passengerState.pickupAddress}
                  driverCoords={{ latitude: activeTripData.currentLat, longitude: activeTripData.currentLng }}
                  vehiclePlate={activeTripData.vehiclePlate}
                  driverName={activeTripData.driverName}
                  onPickupReassigned={(newCoords, address) => {
                    showToast('Admin updated pickup node & pushed waypoint to driver app!');
                  }}
                />
              </div>
            </div>

            {/* BOTTOM DUAL COLUMNS (LIGHT BG) */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* TELEMETRY FEED (2 COLS) */}
              <div className="md:col-span-2 bg-white border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>Active Atharva Fleet Telemetry</span>
                  </h3>
                  <span className="text-xs text-slate-500">Live GPS Stream</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">KA-03-HA-8821</span>
                      <span className="text-slate-600 block">Toyota Innova Crysta • Driver: Suresh Babu (+91 98765 43210)</span>
                      <span className="text-blue-700 font-semibold block mt-0.5">Route: Indiranagar ➔ Tech Park Campus (3 Passengers)</span>
                    </div>
                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold">On-Time (34 km/h)</span>
                      <button onClick={() => setIsLocationModalOpen(true)} className="block mt-1.5 text-blue-700 hover:underline font-bold">
                        Reassign Node
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">KA-05-MJ-4310</span>
                      <span className="text-slate-600 block">Toyota Innova • Driver: Mahesh Gowda (+91 98450 77112)</span>
                      <span className="text-blue-700 font-semibold block mt-0.5">Route: Whitefield ➔ Tech Park Campus (4 Passengers)</span>
                    </div>
                    <div className="text-right">
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 font-bold">+4m Delay</span>
                      <span className="block text-slate-500 mt-1">Light Traffic</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DISPATCH ACTION LOG (1 COL) */}
              <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Driver Reassignment Dispatch Log</span>
                </h3>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                  <span className="font-bold text-blue-900 block">Trip #ATH-8821 Dispatched</span>
                  <p className="text-slate-700">Route: <strong>Domlur ➔ Indiranagar ➔ Tech Park Main Campus</strong></p>
                  <p className="text-blue-800 italic">"Automatic route optimization synchronized"</p>
                  <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                    ✓ GPS Waypoint successfully pushed to driver navigation unit
                  </span>
                </div>

                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold py-2.5 text-xs transition-colors shadow-sm"
                >
                  Manual Geolocation Dispatch
                </button>
              </div>

            </div>

          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Location Issue Reassignment & Password Reset)                   */}
      {/* ========================================================================= */}
      <LocationIssueModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        tripId={activeTripData.tripId}
        employeeId="emp-9042"
        currentAddress={passengerState.pickupAddress}
        onLocationUpdated={(newAddress, newCoords) => {
          setPassengerState(prev => ({
            ...prev,
            pickupAddress: newAddress,
            pickupCoords: newCoords,
            isReassigned: true,
            reassignmentReason: 'Reassigned via Employee/Admin portal',
          }));
          setIsLocationModalOpen(false);
          showToast(`Location reassigned to ${newAddress} and pushed to driver!`);
        }}
      />

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-none shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-blue-700">
              <KeyRound className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-800">Reset Your Password</h3>
            </div>
            
            {resetSuccess ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-sm text-slate-700 font-medium">
                  Password reset link sent to <strong>{resetEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetSuccess(false);
                  }}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-none text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSuccess(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-500">
                  Enter your registered Corporate Email or Staff ID. A secure one-time verification link will be sent.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter corporate email"
                  className="w-full border border-slate-300 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow-sm"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
