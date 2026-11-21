'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  PhoneCall,
  KeyRound,
  Compass,
  ArrowRight,
  ArrowLeft,
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
  QrCode,
  Smartphone,
  Info,
  AlertCircle,
  Wrench,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
} from 'lucide-react';
import { LocationIssueModal } from '@/components/LocationIssueModal';
import { GoogleMapsTracker } from '@/components/GoogleMapsTracker';
import { SettingsModule, SettingsSubTab } from '@/components/SettingsModule';
import { DriverMobileApp } from '@/components/DriverMobileApp';
import { EmployeeMobileApp } from '@/components/EmployeeMobileApp';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/lib/storage';

type LoginRole = 'vendor' | 'admin';
type ViewState = 'login' | 'vendor-portal' | 'driver-app' | 'employee-app';

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
  shiftDate?: string;
  address: string;
  coords: { latitude: number; longitude: number };
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  boardingOtp: string;
  status: 'SCHEDULED' | 'BOARDED' | 'EN_ROUTE' | 'COMPLETED' | 'NO_SHOW';
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

export interface AvailableCabRecord {
  vehicleId?: string;
  driverId?: string;
  plate: string;
  model: string;
  driver: string;
  phone: string;
  capacity: string;
  eta: string;
}

export default function ETSPortal() {
  // Maintenance mode bypass state (persisted in localStorage so developers stay unlocked)
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
  const [dashboardMode, setDashboardMode] = useState<'Operations' | 'Cab Allocation'>('Operations');
  const [rosterSubTab, setRosterSubTab] = useState<'unassigned' | 'assigned'>('assigned');
  
  // LOGIN / LOGOUT direction & Controls
  const [tripDirection, setTripDirection] = useState<'LOGIN' | 'LOGOUT'>('LOGIN');
  const [selectedShift, setSelectedShift] = useState<string>('09:00');
  const [trackingTripCode, setTrackingTripCode] = useState<string | null>(null);
  const [isAllocatingCabId, setIsAllocatingCabId] = useState<string | null>(null);

  // Normalize shift time strings e.g. "09:00", "9:00", "9:00 AM", "09:00 AM", "9 AM"
  const normalizeShiftTime = (t: string): string => {
    if (!t) return '';
    const clean = t.trim().toLowerCase();
    const m = clean.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (!m) return clean;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const mer = m[3]?.toLowerCase();
    if (mer === 'pm' && h < 12) h += 12;
    if (mer === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  const isShiftMatch = (itemTime: string, targetShift: string): boolean => {
    if (!itemTime) return false;
    if (targetShift === 'ALL') return true;
    return normalizeShiftTime(itemTime) === normalizeShiftTime(targetShift);
  };

  const [dbVehicles, setDbVehicles] = useState<any[]>([]);
  const [dbDrivers, setDbDrivers] = useState<any[]>([]);

  const availableCabs: AvailableCabRecord[] = useMemo(() => {
    if (dbVehicles.length === 0) return [];
    return dbVehicles.map((v) => {
      const driver = dbDrivers.find((d) => d.assignedVehicleId === v.id) || dbDrivers[0] || {
        id: 'drv-default',
        fullName: 'Fleet Chauffeur',
        phone: '+91 98765 43210',
      };
      return {
        vehicleId: v.id,
        driverId: driver.id || 'drv-suresh',
        plate: v.plateNumber,
        model: `${v.make} ${v.model}`,
        driver: driver.fullName,
        phone: driver.phone,
        capacity: `${v.seatingCapacity} Seater`,
        eta: v.isActive ? 'Active on Fleet Radar' : 'Standby Depot',
      };
    });
  }, [dbVehicles, dbDrivers]);

  const handleDirectAllocateCab = async (requestId: string, targetPlate?: string) => {
    setIsAllocatingCabId(requestId);
    try {
      const cab = availableCabs.find((c) => c.plate === targetPlate) || availableCabs[0];
      if (!cab) {
        showToast('No vehicle available for allocation');
        return;
      }
      const res = await fetch('/api/portal/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_cab',
          requestId,
          cabPlate: cab.plate,
          driverId: cab.driverId || 'drv-suresh',
          driverName: cab.driver,
          driverPhone: cab.phone,
          vendorActor: 'Atharva Corporate Fleet Vendor',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Allocated Cab ${cab.plate} (${cab.driver}) to Request!`);
        await fetchLiveBackendTrips();
      } else {
        showToast('Error allocating cab');
      }
    } catch (e) {
      showToast('Failed to allocate cab to request');
    } finally {
      setIsAllocatingCabId(null);
    }
  };
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('WalmartLabs');
  // 1-Year Historical & Future Schedule Horizon
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-11');
  
  // User Profile Dropdown & Sign Out Confirmation State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState<boolean>(false);
  
  // Real-Time Draggable Operational Dual Time Slider
  const [sliderStartMins, setSliderStartMins] = useState<number>(720); // 12:00
  const [sliderEndMins, setSliderEndMins] = useState<number>(1200); // 20:00
  const [isDraggingSlider, setIsDraggingSlider] = useState<'start' | 'end' | null>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  // Helper: Format YYYY-MM-DD into "11 Nov 2026"
  const formatDisplayDate = (dStr: string): string => {
    try {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length !== 3) return dStr;
      const [y, m, d] = parts.map(Number);
      const dt = new Date(y, m - 1, d);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d} ${months[dt.getMonth()]} ${y}`;
    } catch {
      return dStr;
    }
  };

  // Helper: Minutes to HH:MM format
  const minsToTimeString = (m: number): string => {
    const clamped = Math.max(0, Math.min(1439, m));
    const hours = Math.floor(clamped / 60);
    const mins = Math.floor((clamped % 60) / 15) * 15;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Quick Date Navigation Helpers across 1-year dataset
  const handlePrevDay = () => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d - 1);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
      showToast(`Selected date: ${formatDisplayDate(`${yyyy}-${mm}-${dd}`)}`);
    } catch {}
  };

  const handleNextDay = () => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d + 1);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
      showToast(`Selected date: ${formatDisplayDate(`${yyyy}-${mm}-${dd}`)}`);
    } catch {}
  };

  // Draggable slider window-level event handler for 100% butter-smooth slide
  useEffect(() => {
    if (!isDraggingSlider) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!sliderTrackRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const rect = sliderTrackRef.current.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawMins = Math.round((fraction * 1440) / 15) * 15;

      if (isDraggingSlider === 'start') {
        const nextStart = Math.min(Math.max(0, rawMins), sliderEndMins - 15);
        setSliderStartMins(nextStart);
      } else if (isDraggingSlider === 'end') {
        const nextEnd = Math.max(Math.min(1440, rawMins), sliderStartMins + 15);
        setSliderEndMins(nextEnd);
      }
    };

    const handleGlobalUp = () => {
      setIsDraggingSlider(null);
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('touchend', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDraggingSlider, sliderStartMins, sliderEndMins]);

  // Draggable slider pointer handlers
  const handleSliderPointerDown = (which: 'start' | 'end', e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSlider(which);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const clickedMins = Math.round((fraction * 1440) / 15) * 15;
    const distToStart = Math.abs(clickedMins - sliderStartMins);
    const distToEnd = Math.abs(clickedMins - sliderEndMins);
    if (distToStart <= distToEnd) {
      setSliderStartMins(Math.min(Math.max(0, clickedMins), sliderEndMins - 15));
    } else {
      setSliderEndMins(Math.max(Math.min(1440, clickedMins), sliderStartMins + 15));
    }
  };

  // Admin Employee Master State
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState<boolean>(false);
  const [adminEmployeeSearch, setAdminEmployeeSearch] = useState<string>('');
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState<boolean>(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    fullName: '',
    employeeCode: '',
    email: '',
    phone: '',
    department: 'Core Supply Chain & Logistics Engineering',
    homeAddress: '',
    officeCampus: 'Enterprise Tech Park, Tower B',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    femaleSafeguard: true,
    defaultShiftTime: '09:00',
  });

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/portal/employees');
      if (res.ok) {
        const data = await res.json();
        if (data.employees) setEmployeesList(data.employees);
      }
    } catch (e) {}
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeForm.fullName || !newEmployeeForm.employeeCode) {
      showToast('Please enter both Full Name and Employee Code.');
      return;
    }
    setIsSubmittingEmployee(true);
    try {
      const res = await fetch('/api/portal/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_employee',
          ...newEmployeeForm,
          actor: currentUser ? `${currentUser.fullName} (${currentUser.staffCode || currentUser.email})` : 'Atharva Super Admin',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Added employee ${data.employee?.fullName} (${data.employee?.employeeCode})!`);
        setIsAddEmployeeModalOpen(false);
        setNewEmployeeForm({
          fullName: '',
          employeeCode: '',
          email: '',
          phone: '',
          department: 'Core Supply Chain & Logistics Engineering',
          homeAddress: '',
          officeCampus: 'Enterprise Tech Park, Tower B',
          gender: 'FEMALE',
          femaleSafeguard: true,
          defaultShiftTime: '09:00',
        });
        await fetchEmployees();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add employee');
      }
    } catch (e) {
      showToast('Error adding employee');
    } finally {
      setIsSubmittingEmployee(false);
    }
  };

  const handleRemoveEmployee = async (emp: any) => {
    if (!window.confirm(`Are you sure you want to remove employee ${emp.fullName} (${emp.employeeCode}) from Atharva Travels Master Roster?`)) {
      return;
    }
    try {
      const res = await fetch('/api/portal/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_employee',
          id: emp.id,
          employeeCode: emp.employeeCode,
          actor: currentUser ? `${currentUser.fullName} (${currentUser.staffCode || currentUser.email})` : 'Atharva Super Admin',
        }),
      });
      if (res.ok) {
        showToast(`🗑️ Removed employee ${emp.fullName} (${emp.employeeCode})`);
        await fetchEmployees();
      } else {
        showToast('Error removing employee');
      }
    } catch (e) {
      showToast('Failed to remove employee');
    }
  };

  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState<number>(12);

  // Operations Map & Telemetry Controls
  const [mapType, setMapType] = useState<'satellite' | 'roadmap' | 'hybrid'>('satellite');
  const [mapFixedLocation, setMapFixedLocation] = useState<boolean>(false);
  const [mapShowSpeed, setMapShowSpeed] = useState<boolean>(true);
  const [mapShowTraffic, setMapShowTraffic] = useState<boolean>(true);
  const [mapShowOTA, setMapShowOTA] = useState<boolean>(true);
  const [isVehiclePanelCollapsed, setIsVehiclePanelCollapsed] = useState<boolean>(false);

  // Operational Modals
  const [isIncompleteTripsModalOpen, setIsIncompleteTripsModalOpen] = useState<boolean>(false);
  const [isInPremiseModalOpen, setIsInPremiseModalOpen] = useState<boolean>(false);
  const [isAdhocTripsModalOpen, setIsAdhocTripsModalOpen] = useState<boolean>(false);
  const [isDelayedVehiclesModalOpen, setIsDelayedVehiclesModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  // Keyboard shortcut refs
  const vehicleSearchRef = useRef<HTMLInputElement>(null);
  const empSearchRef = useRef<HTMLInputElement>(null);
  const tripSearchRef = useRef<HTMLInputElement>(null);
  
  // Search inputs
  const [searchCriteria, setSearchCriteria] = useState<'Employee ID' | 'Name' | 'Phone'>('Employee ID');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [searchVehicleInput, setSearchVehicleInput] = useState('');
  const [searchEmpInput, setSearchEmpInput] = useState('');
  const [searchTripInput, setSearchTripInput] = useState('');
  const [selectedActiveTripId, setSelectedActiveTripId] = useState<string>('');

  // ALLOCATE CABS State
  const [routesList, setRoutesList] = useState<RouteAllocationRecord[]>([]);
  const [allocateDate, setAllocateDate] = useState('09/11/2026');
  const [allocateOffice, setAllocateOffice] = useState('ALL');
  const [allocateShiftType, setAllocateShiftType] = useState('Login');
  const [allocateShift, setAllocateShift] = useState('All');
  const [allocateSubTab, setAllocateSubTab] = useState<'Pending' | 'Allocated'>('Pending');
  const [allocateSort, setAllocateSort] = useState('Employees');
  const [allocateSortOrder, setAllocateSortOrder] = useState('Desc');
  const [selectedRouteId, setSelectedRouteId] = useState('');

  // Live Location Issue Reassignment Modal
  const [passengerState, setPassengerState] = useState({
    pickupAddress: 'Golden Palms Apts, Indiranagar 100ft Road, Bangalore',
    pickupCoords: { latitude: 12.9719, longitude: 77.6412 },
    isReassigned: false,
    reassignmentReason: '',
  });

  // Dynamic QR Code Boarding Status across Driver & Employee Apps
  const [isPassengerBoarded, setIsPassengerBoarded] = useState<boolean>(false);

  // Settings Sub-Tab Navigation
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('VEHICLE_CONTRACTS');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Database Synchronized State (Trips, Telemetry & SOS Alerts & Ride Requests)
  const [dbTrips, setDbTrips] = useState<any[]>([]);
  const [liveFleet, setLiveFleet] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING_ADMIN' | 'PUSHED_TO_VENDOR' | 'ASSIGNED_BY_VENDOR'>('ALL');
  const [isPushingRequest, setIsPushingRequest] = useState<string | null>(null);

  const fetchLiveBackendTrips = async () => {
    try {
      const [tripsRes, telemRes, sosRes, reqsRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/telemetry'),
        fetch('/api/sos'),
        fetch('/api/portal/requests'),
      ]);

      if (tripsRes.ok) {
        const data = await tripsRes.json();
        if (data.trips) {
          setDbTrips(data.trips);
          if (data.trips.length > 0 && !selectedActiveTripId) {
            setSelectedActiveTripId(data.trips[0].tripCode || data.trips[0].id);
          }
        }
        if (data.vehicles) setDbVehicles(data.vehicles);
        if (data.drivers) setDbDrivers(data.drivers);
      }

      if (telemRes.ok) {
        const data = await telemRes.json();
        if (data.fleet) setLiveFleet(data.fleet);
      }

      if (sosRes.ok) {
        const data = await sosRes.json();
        if (data.alerts) {
          const actives = data.alerts.filter(
            (a: any) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED' || a.status === 'QRT_DISPATCHED'
          );
          setActiveAlerts(actives);
        }
      }

      if (reqsRes.ok) {
        const data = await reqsRes.json();
        if (data.requests) {
          setRideRequests(data.requests);
          // Auto-sync pushed requests into Vendor Portal routesList
          const pushedReqs = data.requests.filter(
            (r: any) => r.status === 'PUSHED_TO_VENDOR' || r.status === 'ASSIGNED_BY_VENDOR'
          );
          if (pushedReqs.length > 0) {
            setRoutesList((prev) => {
              let updated = [...prev];
              for (const req of pushedReqs) {
                const routeId = req.bookingCode.replace('REQ-', 'RO-');
                const existingIdx = updated.findIndex((r) => r.routeId === routeId);
                const isAllocated = req.status === 'ASSIGNED_BY_VENDOR';
                if (existingIdx === -1) {
                  updated.unshift({
                    routeId,
                    status: isAllocated ? 'ALLOCATED' : 'PENDING',
                    firstPickup: req.pickupAddress,
                    firstPickupTime: req.shiftTime,
                    drop: req.dropAddress,
                    distanceKm: '14.8 Km',
                    assignedCount: isAllocated ? 1 : 0,
                    totalCapacity: 4,
                    assignedCabPlate: req.assignedCabPlate,
                    assignedDriver: req.assignedDriverName,
                    assignedDriverPhone: req.assignedDriverPhone,
                    passengers: [
                      {
                        empCode: req.employeeCode,
                        name: req.employeeName,
                        pickupNode: req.pickupAddress,
                        pickupTime: req.shiftTime,
                        phone: req.employeePhone,
                        pin: req.boardingOtp || '7492',
                      },
                    ],
                  });
                } else if (isAllocated && updated[existingIdx].status !== 'ALLOCATED') {
                  updated[existingIdx] = {
                    ...updated[existingIdx],
                    status: 'ALLOCATED',
                    assignedCount: 1,
                    assignedCabPlate: req.assignedCabPlate,
                    assignedDriver: req.assignedDriverName,
                    assignedDriverPhone: req.assignedDriverPhone,
                  };
                }
              }
              return updated;
            });
          }
        }
      }
    } catch (e) {}
  };

  // Synchronize routesList directly from real database trips and pending ride requests
  useEffect(() => {
    const list: RouteAllocationRecord[] = [];

    // 1. Allocated routes from genuine database trips
    for (const trip of dbTrips) {
      list.push({
        routeId: trip.tripCode || trip.id,
        status: 'ALLOCATED',
        firstPickup: trip.passengers?.[0]?.pickupAddress || trip.routeName?.split('➔')[0]?.trim() || 'Central Bay',
        firstPickupTime: trip.passengers?.[0]?.scheduledPickupTime || trip.shiftTime || '09:00',
        drop: trip.passengers?.[0]?.dropAddress || trip.corporateClient || 'Enterprise Tech Park',
        distanceKm: `${trip.totalDistanceKm || 12.4} km`,
        assignedCount: trip.passengers?.length || 0,
        totalCapacity: trip.vehicle?.seatingCapacity || 4,
        assignedCabPlate: trip.vehicle?.plateNumber,
        assignedDriver: trip.driver?.fullName,
        assignedDriverPhone: trip.driver?.phone,
        isBackToBack: false,
        needsMarshal: trip.passengers?.some((p: any) => p.femaleSafeguard) || false,
        hasSpecialNeeds: false,
        passengers: (trip.passengers || []).map((p: any) => ({
          empCode: p.employeeCode,
          name: p.fullName,
          pickupNode: p.pickupAddress,
          pickupTime: p.scheduledPickupTime || trip.shiftTime || '09:00',
          phone: p.phone,
          pin: p.boardingOtp || '----',
        })),
      });
    }

    // 2. Pending routes from unassigned/pushed ride requests
    const pendingRequests = rideRequests.filter(
      (r: any) => r.status === 'PUSHED_TO_VENDOR' || r.status === 'PENDING_ADMIN'
    );
    for (const req of pendingRequests) {
      const routeId = req.bookingCode ? req.bookingCode.replace('REQ-', 'RO-') : `RO-${req.id.slice(0, 6)}`;
      list.push({
        routeId,
        status: 'PENDING',
        firstPickup: req.pickupAddress,
        firstPickupTime: req.shiftTime,
        drop: req.dropAddress,
        distanceKm: '12.0 Km',
        assignedCount: 0,
        totalCapacity: 4,
        isBackToBack: false,
        needsMarshal: false,
        hasSpecialNeeds: false,
        passengers: [
          {
            empCode: req.employeeCode,
            name: req.employeeName,
            pickupNode: req.pickupAddress,
            pickupTime: req.shiftTime,
            phone: req.employeePhone,
            pin: req.boardingOtp || '0000',
          },
        ],
      });
    }

    setRoutesList(list);
    if (list.length > 0 && !selectedRouteId) {
      setSelectedRouteId(list[0].routeId);
    }
  }, [dbTrips, rideRequests]);

  const handleAdminPushToVendor = async (requestId: string, targetVendor: string = 'Eco Rent a Car') => {
    try {
      setIsPushingRequest(requestId);
      const res = await fetch('/api/portal/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'push_to_vendor',
          requestId,
          targetVendor,
          adminActor: currentUser ? `${currentUser.fullName} (${currentUser.staffCode || currentUser.email})` : 'Atharva Super Admin',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Pushed #${data.request?.bookingCode || requestId} to Vendor Portal (${targetVendor}) for Cab Allocation!`);
        await fetchLiveBackendTrips();
      }
    } catch (e) {
      showToast('Error pushing request to Vendor Portal');
    } finally {
      setIsPushingRequest(null);
    }
  };

  useEffect(() => {
    fetchLiveBackendTrips();
    fetchEmployees();
    const interval = setInterval(fetchLiveBackendTrips, 3000);
    const timer = setInterval(() => {
      setLastUpdatedSeconds((prev) => (prev >= 60 ? 1 : prev + 1));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  // Keyboard Shortcuts: ALT + Q (Vehicle), CTRL + E (Employee), ALT + T (Trip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        vehicleSearchRef.current?.focus();
        showToast('Focused Vehicle Search (ALT + Q)');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        empSearchRef.current?.focus();
        showToast('Focused Employee Search (CTRL + E)');
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        tripSearchRef.current?.focus();
        showToast('Focused Trip Search (ALT + T)');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAcknowledgeSOS = async (alertId: string) => {
    try {
      const res = await fetch('/api/sos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'ACKNOWLEDGED', adminName: currentUser?.fullName }),
      });
      if (res.ok) {
        showToast('SOS Incident ACKNOWLEDGED by Operations Lead.');
        fetchLiveBackendTrips();
      }
    } catch (e) {}
  };

  const handleDispatchQRT = async (alertId: string) => {
    try {
      const res = await fetch('/api/sos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'QRT_DISPATCHED', adminName: currentUser?.fullName }),
      });
      if (res.ok) {
        showToast('🚨 Quick Response Team (QRT) & Escort Dispatched!');
        fetchLiveBackendTrips();
      }
    } catch (e) {}
  };

  const handleResolveSOS = async (alertId: string) => {
    try {
      const res = await fetch('/api/sos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'RESOLVED', adminName: currentUser?.fullName }),
      });
      if (res.ok) {
        showToast('✅ SOS Incident RESOLVED and closed.');
        fetchLiveBackendTrips();
      }
    } catch (e) {}
  };

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
    // 1. Permanently Hydrate Saved Allocations & Passenger Location
    const savedRoutes = getStoredItem<RouteAllocationRecord[]>(STORAGE_KEYS.ROUTES, null as any);
    if (savedRoutes && Array.isArray(savedRoutes) && savedRoutes.length > 0) {
      setRoutesList(savedRoutes);
    }
    const savedPassenger = getStoredItem<any>(STORAGE_KEYS.PASSENGER_STATE, null as any);
    if (savedPassenger && savedPassenger.pickupAddress) {
      setPassengerState(savedPassenger);
    }

    // 2. Strict Session Verification (Restricted Solely to 3 Authorized Admins)
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const allowedAdmins = [
            'harish.admin@atharvatravels.com',
            'bhaskar.admin@atharvatravels.com',
            'hemaraj.admin@atharvatravels.com',
            'billing.audit@enterprise.internal',
            'facilities.head@walmart.internal',
          ];
          if (data.authenticated && data.user && allowedAdmins.includes(data.user.email?.toLowerCase())) {
            setCurrentUser(data.user);
            setViewState('vendor-portal');
            setActiveHeaderTab('DASHBOARD');
            return;
          }
        }
        // If not strictly authorized, enforce login state
        setCurrentUser(null);
        setViewState('login');
      } catch (err) {
        console.error('Session verify error:', err);
        setCurrentUser(null);
        setViewState('login');
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
        const allowedAdmins = [
          'harish.admin@atharvatravels.com',
          'bhaskar.admin@atharvatravels.com',
          'hemaraj.admin@atharvatravels.com',
          'billing.audit@enterprise.internal',
          'facilities.head@walmart.internal',
        ];
        if (!data.user || !allowedAdmins.includes(data.user.email?.toLowerCase())) {
          setAuthError('Access Denied: Restricted access portal. Access is strictly limited to authorized Atharva administrators.');
          setCurrentUser(null);
          setViewState('login');
          return;
        }

        setCurrentUser(data.user);
        showToast(`Authentication verified: Welcome ${data.user.fullName}`);
        setViewState('vendor-portal');
        setActiveHeaderTab('DASHBOARD');
      } else {
        setAuthError(data.error || 'Access Denied: Invalid credentials or unauthorized account.');
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

  // Cab Allocation Handler (Persisted in PostgreSQL/Prisma Unified DB)
  const handleAllocateCabToRoute = async (routeId: string, cab: AvailableCabRecord) => {
    try {
      const selectedRoute = routesList.find(r => r.routeId === routeId);
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftDate: selectedDate || new Date().toISOString().split('T')[0],
          shiftTime: selectedShift && selectedShift !== 'ALL' ? selectedShift : '09:00',
          type: tripDirection,
          corporateClient: selectedBusinessUnit,
          routeName: selectedRoute ? `${selectedRoute.firstPickup} → ${selectedRoute.drop}` : 'Transit Corridor → Campus',
          vehicleId: cab.vehicleId || 'veh-8821',
          driverId: cab.driverId || 'drv-suresh',
          passengers: selectedRoute && selectedRoute.passengers.length > 0 ? selectedRoute.passengers.map((e, idx) => ({
            employeeId: `emp-${e.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            employeeCode: e.empCode,
            fullName: e.name,
            phone: e.phone,
            gender: 'MALE',
            femaleSafeguard: false,
            department: 'Operations',
            pickupAddress: e.pickupNode,
            pickupCoords: { latitude: 12.9719 + idx * 0.003, longitude: 77.6412 + idx * 0.002 },
            dropAddress: selectedRoute.drop,
            dropCoords: { latitude: 12.9352, longitude: 77.6946 },
            scheduledPickupTime: e.pickupTime,
          })) : [
            {
              employeeId: 'emp-auto',
              employeeCode: 'EMP-AUTO',
              fullName: 'Assigned Commuter',
              phone: '+91 98450 00000',
              gender: 'MALE',
              femaleSafeguard: false,
              department: 'Operations',
              pickupAddress: selectedRoute?.firstPickup || 'Pickup Node',
              pickupCoords: { latitude: 12.9719, longitude: 77.6412 },
              dropAddress: selectedRoute?.drop || 'Campus',
              dropCoords: { latitude: 12.9352, longitude: 77.6946 },
              scheduledPickupTime: selectedRoute?.firstPickupTime || '09:00',
            }
          ],
          actor: currentUser ? `${currentUser.fullName} (${currentUser.staffCode || currentUser.email})` : 'Atharva Super Admin',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`✅ Trip #${data.trip?.tripCode || routeId} created in Database! Cab ${cab.plate} allocated & dispatched to Driver ${cab.driver}.`);

        // If this route originated from an employee ride request, update it to ASSIGNED_BY_VENDOR
        const matchingReq = rideRequests.find(
          (r) => r.bookingCode.replace('REQ-', 'RO-') === routeId || r.id === routeId || r.bookingCode === routeId
        );
        if (matchingReq) {
          await fetch('/api/portal/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'assign_cab',
              requestId: matchingReq.id,
              cabPlate: cab.plate,
              driverId: cab.driverId || 'drv-suresh',
              driverName: cab.driver,
              driverPhone: cab.phone,
              vendorActor: 'Corporate Vendor Desk (Atharva Travels)',
            }),
          }).catch(() => {});
        }

        fetchLiveBackendTrips();
      }
    } catch (e) {
      console.warn('Backend trip creation notice:', e);
    }

    setRoutesList(prev => {
      const updated = prev.map(r => {
        if (r.routeId === routeId) {
          return {
            ...r,
            status: 'ALLOCATED' as const,
            assignedCount: r.totalCapacity,
            assignedCabPlate: cab.plate,
            assignedDriver: cab.driver,
            assignedDriverPhone: cab.phone,
          };
        }
        return r;
      });
      setStoredItem(STORAGE_KEYS.ROUTES, updated);
      return updated;
    });
  };

  // Cab Deallocation Handler (Persisted Permanently)
  const handleDeallocateCabFromRoute = (routeId: string) => {
    setRoutesList(prev => {
      const updated = prev.map(r => {
        if (r.routeId === routeId) {
          return {
            ...r,
            status: 'PENDING' as const,
            assignedCount: 0,
            assignedCabPlate: undefined,
            assignedDriver: undefined,
            assignedDriverPhone: undefined,
          };
        }
        return r;
      });
      setStoredItem(STORAGE_KEYS.ROUTES, updated);
      return updated;
    });
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

  const liveCommuters: CommuterRecord[] = useMemo(() => {
    const list: CommuterRecord[] = [];
    const seenEmpCodes = new Set<string>();

    for (const trip of dbTrips) {
      if (!trip.passengers || !Array.isArray(trip.passengers)) continue;
      for (const p of trip.passengers) {
        const uniqueKey = `${p.employeeCode}-${trip.shiftDate || ''}-${trip.shiftTime || ''}-${trip.type || ''}`;
        if (seenEmpCodes.has(uniqueKey)) continue;
        seenEmpCodes.add(uniqueKey);

        const isBoarded = p.boardingStatus === 'BOARDED';
        const isNoShow = p.boardingStatus === 'NO_SHOW';
        const isEnRoute = trip.status === 'IN_TRANSIT';

        list.push({
          id: p.id || `pax-${p.employeeCode}`,
          empCode: p.employeeCode,
          name: p.fullName,
          department: p.department || 'Enterprise Client Ops',
          phone: p.phone,
          tripId: trip.tripCode || trip.id,
          direction: trip.type || 'LOGIN',
          shift: trip.shiftTime || '09:00',
          shiftDate: trip.shiftDate,
          address: (trip.type === 'LOGOUT' ? p.dropAddress : p.pickupAddress) || 'Corporate Node',
          coords: (trip.type === 'LOGOUT' ? p.dropCoords : p.pickupCoords) || { latitude: 12.9719, longitude: 77.6412 },
          vehiclePlate: trip.vehicle?.plateNumber || 'TBD',
          driverName: trip.driver?.fullName || 'Assigned Driver',
          driverPhone: trip.driver?.phone || '',
          boardingOtp: p.boardingOtp || '----',
          status: isBoarded ? 'BOARDED' : isNoShow ? 'NO_SHOW' : isEnRoute ? 'EN_ROUTE' : 'SCHEDULED',
          eta: isBoarded ? 'Boarded' : isEnRoute ? 'En Route' : 'Scheduled',
          hasEscortGuard: trip.hasEscortGuard || p.femaleSafeguard,
          escortGuardName: trip.escortGuardName || (p.femaleSafeguard ? 'Security Marshal' : undefined),
        });
      }
    }

    for (const req of rideRequests) {
      const uniqueKey = `${req.employeeCode}-${req.shiftDate || ''}-${req.shiftTime || ''}-${req.direction || ''}`;
      if (seenEmpCodes.has(uniqueKey)) continue;
      seenEmpCodes.add(uniqueKey);

      list.push({
        id: req.id,
        empCode: req.employeeCode,
        name: req.employeeName,
        department: req.department || 'Enterprise Ops',
        phone: req.employeePhone,
        tripId: req.assignedTripId || req.bookingCode,
        direction: req.direction,
        shift: req.shiftTime,
        shiftDate: req.shiftDate,
        address: (req.direction === 'LOGOUT' ? req.dropAddress : req.pickupAddress) || 'Pickup Point',
        coords: (req.direction === 'LOGOUT' ? req.dropCoords : req.pickupCoords) || { latitude: 12.9719, longitude: 77.6412 },
        vehiclePlate: req.assignedCabPlate || 'Pending Allocation',
        driverName: req.assignedDriverName || 'Awaiting Cab',
        driverPhone: req.assignedDriverPhone || '',
        boardingOtp: req.boardingOtp || '----',
        status: req.status === 'ASSIGNED_BY_VENDOR' ? 'SCHEDULED' : 'SCHEDULED',
        eta: req.status === 'ASSIGNED_BY_VENDOR' ? 'Cab Assigned' : 'Awaiting Cab',
        hasEscortGuard: false,
      });
    }

    return list;
  }, [dbTrips, rideRequests]);

  const filteredCommuters = useMemo(() => {
    return liveCommuters.filter((c) => {
      if (c.shiftDate && selectedDate && c.shiftDate !== selectedDate) {
        return false;
      }

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

      const matchesShift = isShiftMatch(c.shift, selectedShift);
      return matchesDirection && matchesShift;
    });
  }, [liveCommuters, selectedDate, tripDirection, effectiveEmpQuery, effectiveTripQuery, selectedShift]);

  const searchedEmployee = effectiveEmpQuery
    ? liveCommuters.find(
        (c) =>
          c.empCode.toLowerCase().includes(effectiveEmpQuery) ||
          c.name.toLowerCase().includes(effectiveEmpQuery)
      ) || null
    : null;

  const searchedTrip = effectiveTripQuery
    ? dbTrips.find((t) => (t.tripCode && t.tripCode.toUpperCase().includes(effectiveTripQuery)) || (t.id && t.id.toUpperCase().includes(effectiveTripQuery))) || null
    : null;

  const currentDbTrip = dbTrips.find((t) => t.id === selectedActiveTripId || t.tripCode === selectedActiveTripId) || (dbTrips.length > 0 ? dbTrips[0] : null);

  const activeTripData = currentDbTrip
    ? {
        tripId: currentDbTrip.tripCode || currentDbTrip.id,
        vehiclePlate: currentDbTrip.vehicle?.plateNumber || 'Unassigned',
        driverName: currentDbTrip.driver?.fullName || 'Unassigned',
        driverPhone: currentDbTrip.driver?.phone || '',
        route: currentDbTrip.routeName || 'Indiranagar ➔ Campus',
        currentLat: currentDbTrip.currentLocation?.latitude || 12.9719,
        currentLng: currentDbTrip.currentLocation?.longitude || 77.6412,
        status: currentDbTrip.status,
        passengersCount: currentDbTrip.passengers?.length || 0,
        boardedCount: currentDbTrip.passengers?.filter((p: any) => p.boardingStatus === 'BOARDED').length || 0,
      }
    : null;

  // Current active route for Allocate Cabs
  const currentSelectedRoute = routesList.find(r => r.routeId === selectedRouteId) || (routesList.length > 0 ? routesList[0] : null);
  const pendingRoutesCount = routesList.filter(r => r.status === 'PENDING').length;
  const allocatedRoutesCount = routesList.filter(r => r.status === 'ALLOCATED').length;
  const totalRoutesCount = routesList.length;

  const inPremiseVehicles = useMemo(() => {
    return dbVehicles.filter(v => v.isActive).map((v) => {
      const driver = dbDrivers.find(d => d.assignedVehicleId === v.id) || dbDrivers[0] || { fullName: 'Depot Standby', phone: 'N/A' };
      return {
        id: v.id,
        plate: v.plateNumber,
        model: `${v.make} ${v.model} (${v.seatingCapacity} Seater)`,
        driver: driver.fullName,
        phone: driver.phone,
        location: 'Corporate Central Hub - Depot Bay',
      };
    });
  }, [dbVehicles, dbDrivers]);

  const delayedVehiclesList = useMemo(() => {
    return dbTrips
      .filter(t => t.status === 'IN_TRANSIT' || t.status === 'PASSENGER_BOARDING' || t.status === 'SCHEDULED')
      .map(t => ({
        plate: t.vehicle?.plateNumber || 'TBD',
        driver: t.driver?.fullName || 'Assigned Driver',
        trip: t.tripCode || t.id,
        exp: t.shiftTime || '09:00',
        curr: t.shiftTime || '09:00',
        delay: '+0m',
        loc: t.routeName || 'En Route',
        reason: 'Normal transit corridor traffic',
      }));
  }, [dbTrips]);

  const incompleteTripsList = useMemo(() => {
    return dbTrips.filter(t => t.status === 'SCHEDULED' || t.status === 'PASSENGER_BOARDING' || t.status === 'DRIVER_ARRIVED');
  }, [dbTrips]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfe] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-top-4">
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

            <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-slate-100/80 w-full max-w-[430px] p-8 sm:p-9 transition-all">
              
              {/* RESTRICTED ACCESS SECURITY NOTICE */}
              <div className="mb-5 p-3 bg-slate-900 text-white flex items-start space-x-2.5 text-xs shadow-sm border-l-4 border-amber-500 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide text-[11px] text-amber-400 block leading-tight">
                    Restricted Enterprise Access
                  </span>
                  <p className="text-[10px] text-slate-300 mt-0.5 leading-normal">
                    Access is restricted solely to authorized Atharva Administrators. All unauthorized connection attempts are blocked and audited.
                  </p>
                </div>
              </div>

              {/* DUAL ROLE TAB SWITCHER - ADMIN & VENDOR */}
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
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0f5fc2]" />
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
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0f5fc2]" />
                  )}
                </button>
              </div>

              {authError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{authError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-6">
                
                <div className="border-b border-slate-300 focus-within:border-[#0f5fc2] transition-colors pb-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {loginRole === 'admin' ? 'Authorized Admin Email' : 'Authorized Personnel Email'}
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name.admin@atharvatravels.com"
                    className="w-full text-sm text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none py-1.5 font-normal rounded-lg"
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
                      className="w-full text-sm text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none py-1.5 pr-8 font-normal rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 bottom-2.5 text-slate-400 hover:text-slate-600 p-0.5 transition-colors rounded-full"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-2 flex items-center justify-center space-x-2 ${
                    identifier && password
                      ? 'bg-[#eceff3] hover:bg-[#0f5fc2] text-[#4b5563] hover:text-white active:scale-[0.99]'
                      : 'bg-[#f1f3f6] text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
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
          
          {/* 1. TOP HEADER NAVIGATION BAR */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="max-w-full mx-auto flex items-center justify-between">
              
              {/* Brand: Atharva Travels */}
              <div className="flex items-center space-x-3">
                <img
                  src="/logo.png"
                  alt="Atharva Travels"
                  className="h-8 w-auto object-contain mix-blend-multiply"
                />
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-slate-900 font-black text-sm tracking-tight block">
                    Atharva Travels
                  </span>
                  <span className="text-slate-500 font-semibold text-[10px] tracking-wide block uppercase">
                    Enterprise Mobility Platform
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
                    showToast('Bus Shuttle Dashboard: 0 Active Employee Transit Lines');
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
                    showToast('Commute SLA Analytics: 0 Completed Trips Recorded');
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
                <div
                  onClick={() => setIsSupportModalOpen(true)}
                  className="relative cursor-pointer p-1 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Help & Support Desk"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1 leading-tight">
                    NEW
                  </span>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                {/* Interactive Operator Profile Dropdown (Settings & Sign Out) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-xs text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer select-none group"
                    title="Click for Profile, Settings & Sign Out"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0f5fc2] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                      {(currentUser?.fullName || 'Harish R.').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center space-x-1.5 text-left">
                      <span className="font-bold text-slate-900 group-hover:text-[#0f5fc2] transition-colors">
                        {currentUser?.fullName || 'Harish R.'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 hidden sm:inline">Atharva Travels Pvt Ltd</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#0f5fc2] transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-[#0f5fc2]' : ''}`} />
                  </button>

                  {/* Backdrop dismiss */}
                  {isProfileMenuOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                  )}

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-2xl rounded-sm py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                      {/* Identity Card */}
                      <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/70">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#0f5fc2] text-white flex items-center justify-center font-black text-sm shadow-sm">
                            {(currentUser?.fullName || 'Harish R.').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {currentUser?.fullName || 'Harish R.'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {currentUser?.email || 'harish.admin@atharvatravels.com'}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-[#0f5fc2] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              Operations Admin
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options: Settings & Sign Out */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setActiveHeaderTab('SETTINGS');
                            showToast('Opening Corporate Settings & Fleet Configuration');
                          }}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0f5fc2] flex items-center space-x-2.5 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Settings</span>
                        </button>

                        <div className="h-px bg-slate-100 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsSignOutConfirmOpen(true);
                          }}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </header>

          {/* CRITICAL SOS ACTIVE INCIDENTS BANNER */}
          {activeAlerts.length > 0 && (
            <div className="bg-red-50 border-b-2 border-red-500 px-6 py-3 shadow-md animate-in fade-in flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 text-white p-2 rounded-xl animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-red-950 uppercase tracking-wide flex items-center space-x-2">
                    <span>🚨 CRITICAL: EMERGENCY SOS INCIDENT ACTIVE ({activeAlerts.length})</span>
                    <span className="bg-red-200 text-red-900 text-[10px] px-2 py-0.5 font-black uppercase">
                      {activeAlerts[0].status}
                    </span>
                  </h4>
                  <p className="text-xs text-red-900 mt-0.5">
                    Passenger: <strong>{activeAlerts[0].employeeName}</strong> ({activeAlerts[0].employeePhone}) • Vehicle: <strong>{activeAlerts[0].vehiclePlate || 'Assigned Vehicle'}</strong> • Chauffeur: {activeAlerts[0].driverName || 'Assigned Driver'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                {activeAlerts[0].status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAcknowledgeSOS(activeAlerts[0].id)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 transition-colors shadow-sm"
                  >
                    Acknowledge
                  </button>
                )}

                {['ACTIVE', 'ACKNOWLEDGED'].includes(activeAlerts[0].status) && (
                  <button
                    onClick={() => handleDispatchQRT(activeAlerts[0].id)}
                    className="bg-red-700 hover:bg-red-600 text-white font-black px-3.5 py-1.5 transition-colors shadow-sm animate-pulse"
                  >
                    Dispatch QRT Escort
                  </button>
                )}

                <button
                  onClick={() => handleResolveSOS(activeAlerts[0].id)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 transition-colors shadow-sm"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD VIEW (From previous screenshot)                           */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'DASHBOARD' && (
            <div className="flex-1 flex flex-col">
              
              {/* 1-Year Date Picker + Timeline Range Slider + Direction Switcher */}
              <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                
                {/* Left: Date Display & 1-Year Navigation + Draggable Range Slider */}
                <div className="flex items-center space-x-3 flex-1 min-w-[340px] max-w-2xl">
                  {/* Interactive Date & Time Window Label */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <div className="relative flex items-center" title="Click calendar to select any date in the 1-year horizon">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDate(e.target.value);
                            showToast(`Filtered schedule for: ${formatDisplayDate(e.target.value)}`);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full z-20"
                      />
                      <Calendar className="w-3.5 h-3.5 text-[#0f5fc2] cursor-pointer" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handlePrevDay}
                      className="text-slate-400 hover:text-slate-800 font-bold px-0.5"
                      title="Previous Day"
                    >
                      ◀
                    </button>
                    
                    <span className="font-bold text-slate-800 text-xs tracking-tight whitespace-nowrap">
                      {formatDisplayDate(selectedDate)} {minsToTimeString(sliderStartMins)} - {formatDisplayDate(selectedDate)} {minsToTimeString(sliderEndMins)}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextDay}
                      className="text-slate-400 hover:text-slate-800 font-bold px-0.5"
                      title="Next Day"
                    >
                      ▶
                    </button>
                  </div>
                  
                  {/* Real-time Draggable Dual-Handle Operational Time Slider */}
                  <div
                    ref={sliderTrackRef}
                    onClick={handleTrackClick}
                    className="relative flex-1 flex items-center max-w-md mx-3 h-7 cursor-pointer select-none"
                    title="Click or drag handles to adjust operational time window"
                  >
                    {/* Continuous Full Background Track */}
                    <div className="h-1.5 bg-slate-200 w-full rounded-full" />
                    
                    {/* Active Range Bar (Blue) */}
                    <div
                      className="absolute h-1.5 bg-[#0f5fc2] rounded-full pointer-events-none"
                      style={{
                        left: `${(sliderStartMins / 1440) * 100}%`,
                        width: `${Math.max(1, ((sliderEndMins - sliderStartMins) / 1440) * 100)}%`,
                      }}
                    />

                    {/* Start Square Handle */}
                    <div
                      onPointerDown={(e) => handleSliderPointerDown('start', e)}
                      onMouseDown={(e) => handleSliderPointerDown('start', e)}
                      className="absolute w-3.5 h-3.5 bg-white border-2 border-[#0f5fc2] shadow-xs cursor-grab active:cursor-grabbing z-20 -translate-x-1/2 hover:scale-125 transition-transform flex items-center justify-center"
                      style={{ left: `${(sliderStartMins / 1440) * 100}%` }}
                      title={`Start Time: ${minsToTimeString(sliderStartMins)}`}
                    />

                    {/* End Square Handle */}
                    <div
                      onPointerDown={(e) => handleSliderPointerDown('end', e)}
                      onMouseDown={(e) => handleSliderPointerDown('end', e)}
                      className="absolute w-3.5 h-3.5 bg-white border-2 border-[#0f5fc2] shadow-xs cursor-grab active:cursor-grabbing z-20 -translate-x-1/2 hover:scale-125 transition-transform flex items-center justify-center"
                      style={{ left: `${(sliderEndMins / 1440) * 100}%` }}
                      title={`End Time: ${minsToTimeString(sliderEndMins)}`}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* UNIFIED SINGLE DROPDOWN FOR BOTH LOGIN AND LOGOUT */}
                  <div className="relative">
                    <select
                      value={`${tripDirection}:${selectedShift}`}
                      onChange={(e) => {
                        const [newDir, newShift] = e.target.value.split(':') as ['LOGIN' | 'LOGOUT', string];
                        handleTripDirectionChange(newDir);
                        setSelectedShift(newShift);
                        showToast(`Filtered for ${newDir} • ${newShift === 'ALL' ? 'All Shifts' : `${newShift} Shift`} on ${formatDisplayDate(selectedDate)}`);
                      }}
                      className="bg-white border-2 border-[#0f5fc2] text-slate-900 font-bold px-3 py-1.5 pr-8 text-xs rounded shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[210px] cursor-pointer appearance-none"
                    >
                      {(() => {
                        const loginShifts = ['ALL', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
                        const logoutShifts = ['ALL', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00'];

                        const loginTotal = rideRequests.filter((r: any) => (!r.shiftDate || r.shiftDate === selectedDate) && r.direction === 'LOGIN').length +
                          dbTrips.filter((t: any) => (!t.shiftDate || t.shiftDate === selectedDate) && t.direction === 'LOGIN').length;

                        const logoutTotal = rideRequests.filter((r: any) => (!r.shiftDate || r.shiftDate === selectedDate) && r.direction === 'LOGOUT').length +
                          dbTrips.filter((t: any) => (!t.shiftDate || t.shiftDate === selectedDate) && t.direction === 'LOGOUT').length;

                        return (
                          <>
                            <optgroup label="────── LOGIN SHIFTS ──────">
                              <option value="LOGIN:ALL">
                                LOGIN - All Shifts ({loginTotal} on {formatDisplayDate(selectedDate)})
                              </option>
                              {loginShifts.filter((s) => s !== 'ALL').map((sTime) => {
                                const count = rideRequests.filter((r: any) => (!r.shiftDate || r.shiftDate === selectedDate) && r.direction === 'LOGIN' && isShiftMatch(r.shiftTime, sTime)).length +
                                  dbTrips.filter((t: any) => (!t.shiftDate || t.shiftDate === selectedDate) && t.direction === 'LOGIN' && isShiftMatch(t.shift || t.shiftTime, sTime)).length;
                                return (
                                  <option key={`LOGIN:${sTime}`} value={`LOGIN:${sTime}`}>
                                    LOGIN {sTime} {count > 0 ? `(${count} booked)` : ''}
                                  </option>
                                );
                              })}
                            </optgroup>
                            <optgroup label="────── LOGOUT SHIFTS ──────">
                              <option value="LOGOUT:ALL">
                                LOGOUT - All Shifts ({logoutTotal} on {formatDisplayDate(selectedDate)})
                              </option>
                              {logoutShifts.filter((s) => s !== 'ALL').map((sTime) => {
                                const count = rideRequests.filter((r: any) => (!r.shiftDate || r.shiftDate === selectedDate) && r.direction === 'LOGOUT' && isShiftMatch(r.shiftTime, sTime)).length +
                                  dbTrips.filter((t: any) => (!t.shiftDate || t.shiftDate === selectedDate) && t.direction === 'LOGOUT' && isShiftMatch(t.shift || t.shiftTime, sTime)).length;
                                return (
                                  <option key={`LOGOUT:${sTime}`} value={`LOGOUT:${sTime}`}>
                                    LOGOUT {sTime} {count > 0 ? `(${count} booked)` : ''}
                                  </option>
                                );
                              })}
                            </optgroup>
                          </>
                        );
                      })()}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#0f5fc2] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Office Selector */}
                  <div className="relative">
                    <select
                      value={selectedBusinessUnit}
                      onChange={(e) => {
                        setSelectedBusinessUnit(e.target.value);
                        showToast(`Filtered operations for office campus: ${e.target.value}`);
                      }}
                      className="bg-white border border-slate-300 px-3 py-1.5 pr-7 font-semibold text-slate-700 appearance-none focus:outline-none focus:border-blue-600 text-xs min-w-[170px]"
                    >
                      <option value="WalmartLabs">WalmartLabs</option>
                      <option value="Enterprise Tech Park">Enterprise Tech Park</option>
                      <option value="Corporate Central Hub">Corporate Central Hub</option>
                      <option value="Bellandur Tech Corridor">Bellandur Tech Corridor</option>
                      <option value="Global Tech Park">Global Tech Park</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Refresh Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        fetchLiveBackendTrips();
                        setLastUpdatedSeconds(0);
                        showToast(`Refreshed ${tripDirection} live operations data for ${formatDisplayDate(selectedDate)}.`);
                      }}
                      className="w-7 h-7 bg-[#0fa958] hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs transition-all hover:rotate-180"
                      title="Refresh Operational Telemetry"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SHIFT TIME QUICK BAR */}
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0f5fc2]" />
                      <span>Quick Select:</span>
                    </span>
                  </div>

                  {/* Quick Shift Pills for Instant 1-Click Access */}
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    <span className="text-[10px] font-black uppercase text-[#0f5fc2] bg-blue-50 px-1.5 py-0.5 rounded">LOGIN:</span>
                    {['09:00', '10:30', '13:30'].map((quickShift) => {
                      const count = rideRequests.filter((r: any) => (!r.shiftDate || r.shiftDate === selectedDate) && r.direction === 'LOGIN' && isShiftMatch(r.shiftTime, quickShift)).length +
                        dbTrips.filter((t: any) => (!t.shiftDate || t.shiftDate === selectedDate) && t.direction === 'LOGIN' && isShiftMatch(t.shift || t.shiftTime, quickShift)).length;
                      return (
                        <button
                          key={`quick-login-${quickShift}`}
                          type="button"
                          onClick={() => {
                            setTripDirection('LOGIN');
                            setSelectedShift(quickShift);
                            showToast(`Shift set to LOGIN ${quickShift}`);
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded transition-all flex items-center space-x-1 ${
                            tripDirection === 'LOGIN' && selectedShift === quickShift
                              ? 'bg-[#0f5fc2] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{quickShift}</span>
                          {count > 0 && (
                            <span className={`text-[10px] font-black px-1 rounded-full ${
                              tripDirection === 'LOGIN' && selectedShift === quickShift ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    <span className="text-slate-300 mx-1">|</span>

                    <span className="text-[10px] font-black uppercase text-[#0f5fc2] bg-blue-50 px-1.5 py-0.5 rounded">LOGOUT:</span>
                    {['18:00', '21:30', '22:30'].map((quickShift) => {
                      const count = rideRequests.filter((r: any) => (!r.shiftDate || r.shiftDate === selectedDate) && r.direction === 'LOGOUT' && isShiftMatch(r.shiftTime, quickShift)).length +
                        dbTrips.filter((t: any) => (!t.shiftDate || t.shiftDate === selectedDate) && t.direction === 'LOGOUT' && isShiftMatch(t.shift || t.shiftTime, quickShift)).length;
                      return (
                        <button
                          key={`quick-logout-${quickShift}`}
                          type="button"
                          onClick={() => {
                            setTripDirection('LOGOUT');
                            setSelectedShift(quickShift);
                            showToast(`Shift set to LOGOUT ${quickShift}`);
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded transition-all flex items-center space-x-1 ${
                            tripDirection === 'LOGOUT' && selectedShift === quickShift
                              ? 'bg-[#0f5fc2] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{quickShift}</span>
                          {count > 0 && (
                            <span className={`text-[10px] font-black px-1 rounded-full ${
                              tripDirection === 'LOGOUT' && selectedShift === quickShift ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShift('ALL');
                        showToast(`Showing All Shifts for ${tripDirection}`);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                        selectedShift === 'ALL'
                          ? 'bg-[#0f5fc2] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      All {tripDirection}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span>Date: <strong className="text-slate-800">{formatDisplayDate(selectedDate)}</strong></span>
                  <span>•</span>
                  <span>Active Shift: <strong className="text-slate-800">{selectedShift}</strong></span>
                  <span>•</span>
                  <span className="bg-blue-50 text-[#0f5fc2] px-2 py-0.5 font-bold uppercase">{tripDirection}</span>
                </div>
              </div>

              {/* Main Split Stage */}
              <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* Left 8 Cols: Operations Lifecycle & Map OR Cab Allocation Roster */}
                <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm flex flex-col min-h-[580px] rounded-2xl overflow-hidden">
                  
                  {dashboardMode === 'Operations' ? (
                    /* OPERATIONS MODE VIEW: LIVE SCHEDULED & BOOKED CABS DASHBOARD */
                    <div className="flex-1 flex flex-col p-5 space-y-4">
                      {(() => {
                        const matchingRequests = rideRequests.filter((r) => {
                          const dateMatch = !r.shiftDate || r.shiftDate === selectedDate;
                          const dirMatch = !tripDirection || r.direction === tripDirection;
                          return dateMatch && dirMatch && isShiftMatch(r.shiftTime, selectedShift);
                        });

                        const matchingTrips = dbTrips.filter((t) => {
                          const dateMatch = !t.shiftDate || t.shiftDate === selectedDate;
                          const dirMatch = !tripDirection || t.direction === tripDirection;
                          return dateMatch && dirMatch && isShiftMatch(t.shift || t.shiftTime, selectedShift);
                        });

                        const totalScheduled = matchingRequests.length + matchingTrips.length;
                        const pendingAdminCount = matchingRequests.filter((r) => r.status === 'PENDING_ADMIN').length;
                        const pushedToVendorCount = matchingRequests.filter((r) => r.status === 'PUSHED_TO_VENDOR').length;
                        const assignedCabsCount =
                          matchingRequests.filter((r) => r.status === 'ASSIGNED_BY_VENDOR').length + matchingTrips.length;

                        if (totalScheduled === 0) {
                          return (
                            <div className="flex-1 flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200 shadow-xs min-h-[460px]">
                              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                <Car className="w-8 h-8" />
                              </div>
                              <h3 className="text-lg font-black text-slate-800">No trips</h3>
                              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                                {selectedShift === 'ALL'
                                  ? `No employee ride requests or booked cabs scheduled on ${formatDisplayDate(selectedDate)}.`
                                  : `No employee rides or cabs scheduled for the ${selectedShift} ${tripDirection} shift on ${formatDisplayDate(selectedDate)}.`}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-2">
                                When an employee books or schedules a ride (e.g. at {selectedShift}), it will appear here immediately in real-time.
                              </p>
                              <div className="flex items-center space-x-2 mt-4">
                                {selectedShift !== 'ALL' && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedShift('ALL')}
                                    className="px-4 py-1.5 bg-[#0f5fc2] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                                  >
                                    View All Shifts on {formatDisplayDate(selectedDate)}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate('2026-11-11');
                                    showToast('Switched to 11 Nov 2026 active commute date');
                                  }}
                                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
                                >
                                  Jump to 11 Nov 2026
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {/* Operational Lifecycle Summary Cards (Live Counts for Selected Shift) */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="border border-slate-200 bg-slate-50 p-3 shadow-xs rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                                  Shift {selectedShift} Total
                                </span>
                                <div className="text-xl font-black text-slate-900 mt-1">
                                  {totalScheduled} <span className="text-xs font-semibold text-slate-500">Scheduled</span>
                                </div>
                              </div>

                              <div className="border border-amber-200 bg-amber-50/60 p-3 shadow-xs rounded-2xl">
                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block">
                                  Awaiting Admin Push
                                </span>
                                <div className="text-xl font-black text-amber-800 mt-1">
                                  {pendingAdminCount} <span className="text-xs font-semibold text-amber-600">Pending</span>
                                </div>
                              </div>

                              <div className="border border-blue-200 bg-blue-50/60 p-3 shadow-xs rounded-2xl">
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block">
                                  Pushed to Vendor
                                </span>
                                <div className="text-xl font-black text-blue-800 mt-1">
                                  {pushedToVendorCount} <span className="text-xs font-semibold text-blue-600">Unassigned</span>
                                </div>
                              </div>

                              <div className="border border-emerald-200 bg-emerald-50/60 p-3 shadow-xs rounded-2xl">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block">
                                  Cab Allocated / Active
                                </span>
                                <div className="text-xl font-black text-emerald-800 mt-1">
                                  {assignedCabsCount} <span className="text-xs font-semibold text-emerald-600">Dispatched</span>
                                </div>
                              </div>
                            </div>

                            {/* Active Trip Telemetry Card (If an assigned trip is selected for tracking) */}
                            {trackingTripCode && (
                              <div className="border border-blue-300 bg-blue-50/30 p-3 space-y-2 shadow-xs animate-in fade-in rounded-2xl">
                                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                                  <div className="flex items-center space-x-2">
                                    <Navigation className="w-4 h-4 text-blue-600" />
                                    <span className="font-bold text-xs text-blue-900">
                                      Live Tracking Trip #{trackingTripCode}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setTrackingTripCode(null)}
                                    className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-0.5"
                                  >
                                    ✕ Close Map
                                  </button>
                                </div>
                                <GoogleMapsTracker
                                  vehiclePlate={
                                    matchingRequests.find((r) => r.bookingCode === trackingTripCode || r.assignedTripCode === trackingTripCode)
                                      ?.vehiclePlate || 'Fleet Vehicle'
                                  }
                                  driverName={
                                    matchingRequests.find((r) => r.bookingCode === trackingTripCode || r.assignedTripCode === trackingTripCode)
                                      ?.driverName || 'Assigned Driver'
                                  }
                                  pickupAddress={
                                    matchingRequests.find((r) => r.bookingCode === trackingTripCode || r.assignedTripCode === trackingTripCode)
                                      ?.pickupAddress || 'Corporate Pickup Point'
                                  }
                                />
                              </div>
                            )}

                            {/* Live Shift Booked Cabs & Commute Schedule Table */}
                            <div className="border border-slate-200 overflow-hidden shadow-xs rounded-2xl">
                              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Car className="w-4 h-4 text-[#0f5fc2]" />
                                  <span className="font-bold text-xs text-slate-800">
                                    Booked Cabs &amp; Schedules ({selectedShift === 'ALL' ? 'All Shifts' : `${selectedShift} Shift`} • {formatDisplayDate(selectedDate)})
                                  </span>
                                  <span className="bg-blue-100 text-[#0f5fc2] text-[10px] font-bold px-1.5 py-0.5">
                                    {totalScheduled} Commuters
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Live Sync • Direction: <strong>{tripDirection}</strong>
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                                    <tr>
                                      <th className="py-2.5 px-3">Booking Code</th>
                                      <th className="py-2.5 px-3">Employee Details</th>
                                      <th className="py-2.5 px-3">Shift &amp; Direction</th>
                                      <th className="py-2.5 px-3">Pickup Address</th>
                                      <th className="py-2.5 px-3">Status Pipeline</th>
                                      <th className="py-2.5 px-3">Assigned Cab</th>
                                      <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {matchingRequests.map((req) => (
                                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                                          #{req.bookingCode}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                                          <div>{req.employeeName}</div>
                                          <div className="text-[11px] text-slate-400 font-normal">
                                            {req.employeeCode} • {req.department}
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="bg-blue-100 text-[#0f5fc2] px-2 py-0.5 font-bold font-mono text-[11px] inline-block">
                                            {req.shiftTime}
                                          </span>
                                          <span className="block text-[10px] text-slate-500 font-bold mt-0.5">
                                            {req.direction}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={req.pickupAddress}>
                                          <div>{req.pickupAddress}</div>
                                          <div className="text-[10px] text-slate-400 font-medium">➔ {req.officeCampus}</div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          {req.status === 'PENDING_ADMIN' && (
                                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide inline-flex items-center space-x-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                              <span>Awaiting Push</span>
                                            </span>
                                          )}
                                          {req.status === 'PUSHED_TO_VENDOR' && (
                                            <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide inline-flex items-center space-x-1">
                                              <span>Pushed to Vendor</span>
                                            </span>
                                          )}
                                          {req.status === 'ASSIGNED_BY_VENDOR' && (
                                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide inline-flex items-center space-x-1">
                                              <span>✓ Cab Allocated</span>
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          {req.assignedVehiclePlate ? (
                                            <div className="text-xs">
                                              <div className="font-bold text-slate-900">{req.assignedVehiclePlate}</div>
                                              <div className="text-[11px] text-slate-500">{req.assignedDriverName}</div>
                                              <div className="text-[10px] font-mono font-bold text-blue-700">OTP: {req.boardingOtp}</div>
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 text-xs italic">Unallocated</span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          {req.status === 'PENDING_ADMIN' && (
                                            <button
                                              onClick={() => handleAdminPushToVendor(req.id)}
                                              disabled={isPushingRequest === req.id}
                                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                                            >
                                              {isPushingRequest === req.id ? 'Pushing...' : 'Push to Vendor ➔'}
                                            </button>
                                          )}
                                          {req.status === 'PUSHED_TO_VENDOR' && (
                                            <button
                                              onClick={() => handleDirectAllocateCab(req.id)}
                                              disabled={isAllocatingCabId === req.id}
                                              className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                                            >
                                              {isAllocatingCabId === req.id ? 'Allocating...' : 'Allocate Cab 🚕'}
                                            </button>
                                          )}
                                          {req.status === 'ASSIGNED_BY_VENDOR' && (
                                            <button
                                              onClick={() => setTrackingTripCode(req.assignedTripCode || req.bookingCode)}
                                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                                            >
                                              Track on Map 📍
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}

                                    {/* Also render active DB trips matching this shift */}
                                    {matchingTrips.map((trip) => (
                                      <tr key={trip.id} className="hover:bg-slate-50 transition-colors bg-blue-50/20">
                                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                                          #{trip.tripCode}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                                          {trip.passengers?.map((p: any) => (
                                            <div key={p.id}>
                                              <div>{p.fullName}</div>
                                              <div className="text-[11px] text-slate-400 font-normal">
                                                {p.employeeCode} • PIN: {p.boardingOtp}
                                              </div>
                                            </div>
                                          ))}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="bg-blue-100 text-[#0f5fc2] px-2 py-0.5 font-bold font-mono text-[11px] inline-block">
                                            {trip.shiftTime || trip.shift || selectedShift}
                                          </span>
                                          <span className="block text-[10px] text-slate-500 font-bold mt-0.5">
                                            {trip.direction || tripDirection}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                          {trip.passengers?.[0]?.pickupAddress || trip.routeName}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide inline-flex items-center space-x-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>Active On-Duty</span>
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <div className="font-bold text-slate-900">{trip.vehicle?.plateNumber}</div>
                                          <div className="text-[11px] text-slate-500">{trip.driver?.fullName}</div>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                          <button
                                            onClick={() => setTrackingTripCode(trip.tripCode)}
                                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 text-xs shadow-xs transition-colors cursor-pointer"
                                          >
                                            Track on Map 📍
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* CAB ALLOCATION MODE VIEW */
                    <div className="flex-1 flex flex-col">
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
                              No record found. Data is not available in the source.
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              All employees scheduled for {tripDirection} shift <strong className="text-slate-700">{selectedShift}</strong> are assigned.
                            </p>
                            <button
                              onClick={() => setRosterSubTab('assigned')}
                              className="mt-4 px-4 py-1.5 bg-[#0f5fc2] hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                            >
                              View Assigned Cabs ({filteredCommuters.length} Commuters)
                            </button>
                          </div>
                        ) : (
                          <div className="w-full space-y-4">
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
                                    filteredCommuters.map((commuter: CommuterRecord) => {
                                      const livePax = currentDbTrip?.passengers?.find(
                                        (p: any) =>
                                          p.employeeCode === commuter.empCode ||
                                          p.fullName?.toLowerCase().includes(commuter.name.toLowerCase())
                                      );
                                      const isBoarded = livePax ? livePax.boardingStatus === 'BOARDED' : commuter.status === 'BOARDED';
                                      const isNoShow = livePax?.boardingStatus === 'NO_SHOW';
                                      const displayPin = livePax ? livePax.boardingOtp : commuter.boardingOtp;

                                      return (
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
                                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{displayPin}</td>
                                          <td className="py-2.5 px-3">
                                            {isBoarded ? (
                                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">Boarded ✓</span>
                                            ) : isNoShow ? (
                                              <span className="bg-red-100 text-red-800 px-2 py-0.5 font-bold text-[10px]">No Show ✕</span>
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
                                      );
                                    })
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
                  )}

                </div>

                {/* Right 4 Cols: Announcement Banner, Mode Switch & Search Sidebar */}
                <div className="lg:col-span-4 space-y-3">
                  
                  {/* Announcement Banner (As shown in screenshot) */}
                  <div className="bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900 font-medium flex items-center justify-between shadow-xs rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-slate-800">A whole new landing experience!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Atharva Travels 24/7 Enterprise Control Center active')}
                      className="text-[#0f5fc2] font-bold hover:underline text-[11px] shrink-0"
                    >
                      Know More
                    </button>
                  </div>

                  {/* Dashboard Mode Switcher */}
                  <div className="bg-white border border-slate-200 p-3.5 shadow-sm flex items-center justify-between rounded-xl">
                    <span className="text-xs font-semibold text-slate-600">Dashboard mode:</span>
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <span className={dashboardMode === 'Operations' ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>Operations</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = dashboardMode === 'Operations' ? 'Cab Allocation' : 'Operations';
                          setDashboardMode(next);
                          if (next === 'Operations') setRosterSubTab('assigned');
                          showToast(`Switched view to ${next} Mode`);
                        }}
                        className={`w-11 h-6 p-0.5 border transition-colors relative cursor-pointer rounded-full ${
                          dashboardMode === 'Cab Allocation' ? 'bg-[#0f5fc2] border-[#0f5fc2]' : 'bg-slate-300 border-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white shadow-sm transition-transform rounded-full ${dashboardMode === 'Cab Allocation' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <span className={dashboardMode === 'Cab Allocation' ? 'text-[#0f5fc2] font-bold' : 'text-slate-400 font-normal'}>Cab Allocation</span>
                    </div>
                  </div>

                  {/* Search Section with Working Hotkey Refs */}
                  <div className="bg-white border border-slate-200 p-4 shadow-sm space-y-3 rounded-2xl">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Search</h3>
                    
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Vehicle ID / Licence Plate (ALT + Q)</span>
                        {searchVehicleInput && <button onClick={() => setSearchVehicleInput('')} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>}
                      </label>
                      <div className="relative">
                        <input
                          ref={vehicleSearchRef}
                          type="text"
                          value={searchVehicleInput}
                          onChange={(e) => setSearchVehicleInput(e.target.value)}
                          placeholder="e.g. KA-03-HA-8821, ECO-355"
                          className="w-full border border-slate-300 py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono text-xs rounded-lg"
                        />
                        <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Employee ID, Name, Phone No (CTRL + E)</span>
                        {searchEmpInput && <button onClick={() => setSearchEmpInput('')} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>}
                      </label>
                      <div className="relative">
                        <input
                          ref={empSearchRef}
                          type="text"
                          value={searchEmpInput}
                          onChange={(e) => setSearchEmpInput(e.target.value)}
                          placeholder="e.g. EMP-9042, 9018, Priya"
                          className="w-full border border-slate-300 py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium rounded-lg"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Trip ID (ALT + T)</span>
                        {searchTripInput && <button onClick={() => setSearchTripInput('')} className="text-slate-400 hover:text-slate-600 text-[10px]">Clear</button>}
                      </label>
                      <div className="relative">
                        <input
                          ref={tripSearchRef}
                          type="text"
                          value={searchTripInput}
                          onChange={(e) => setSearchTripInput(e.target.value)}
                          placeholder="e.g. ATH-8821, ATH-4310"
                          className="w-full border border-slate-300 py-2 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono font-medium rounded-lg"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {searchedEmployee && (
                    <div className="bg-white border-2 border-[#0f5fc2] p-4 shadow-md space-y-3 animate-in fade-in rounded-2xl">
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
                    <div className="bg-white border-2 border-emerald-600 p-4 shadow-md space-y-3 animate-in fade-in rounded-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-slate-900">Trip #{searchedTrip.tripCode || searchedTrip.id}</span>
                        </div>
                        <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">{searchedTrip.vehicle?.plateNumber || 'Cab Assigned'}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-semibold">Driver</span>
                          <span className="font-semibold text-slate-800">{searchedTrip.driver?.fullName || 'Chauffeur Assigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px] uppercase font-semibold">Route &amp; Status</span>
                          <span className="font-bold text-emerald-700">{searchedTrip.status} • {searchedTrip.routeName}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedActiveTripId(searchedTrip.tripCode || searchedTrip.id);
                          setRosterSubTab('assigned');
                          showToast(`Tracking Trip #${searchedTrip.tripCode || searchedTrip.id} on Google Maps radar`);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 text-xs text-center rounded-lg"
                      >
                        Track on Map
                      </button>
                    </div>
                  )}

                  <div className="bg-[#f0f6ff] border border-blue-200 p-3 shadow-sm flex items-center justify-between text-xs rounded-xl">
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
                    <div className="flex items-center border border-slate-300 px-2.5 py-1 bg-white rounded-lg">
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
                        className="border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-800 appearance-none focus:outline-none min-w-[130px] rounded-lg"
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
                        className="border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-800 appearance-none focus:outline-none min-w-[110px] rounded-lg"
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
                        className="border border-slate-300 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-800 appearance-none focus:outline-none min-w-[100px] rounded-lg"
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
                <div className="border border-slate-200 overflow-hidden shadow-sm rounded-xl">
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
                        <td className="py-1">{totalRoutesCount}</td>
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
                    className="border border-slate-300 bg-white py-0.5 pl-2 pr-6 text-xs text-slate-800 appearance-none focus:outline-none rounded-lg"
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
                    className="border border-slate-300 bg-white py-0.5 pl-2 pr-6 text-xs text-slate-800 appearance-none focus:outline-none rounded-lg"
                  >
                    <option value="Desc">Desc</option>
                    <option value="Asc">Asc</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => showToast('Sorted routes by ' + allocateSort + ' (' + allocateSortOrder + ')')}
                  className="border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-0.5 text-xs font-bold text-slate-700 rounded-lg"
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
                        className={`border p-4 shadow-sm cursor-pointer transition-all rounded-xl ${
                          selectedRouteId === route.routeId
                            ? 'border-[#0f5fc2] bg-white ring-1 ring-[#0f5fc2]'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-100">
                          <span>Route Id: {route.routeId}({route.assignedCount}/{route.totalCapacity})</span>
                          {route.status === 'ALLOCATED' ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold rounded">Allocated</span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold rounded">Pending</span>
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
                    <div className="p-8 border border-slate-200 bg-white text-center text-xs text-slate-400 rounded-xl">
                      No routes in {allocateSubTab} queue.
                    </div>
                  )}
                </div>

                {/* COLUMN 2: SELECTED ROUTE PASSENGERS & STOPS (Middle 5 cols) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm p-5 space-y-4 min-h-[460px] rounded-xl">
                  {currentSelectedRoute ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            Route Manifest: #{currentSelectedRoute.routeId}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {currentSelectedRoute.firstPickup} ➔ {currentSelectedRoute.drop} • {currentSelectedRoute.distanceKm}
                          </span>
                        </div>
                        <span className="bg-blue-100 text-[#0f5fc2] text-xs font-bold px-2 py-0.5 rounded-md">
                          {currentSelectedRoute.passengers.length} Employees Rostered
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentSelectedRoute.passengers.map((p, idx) => (
                          <div key={p.empCode} className="border border-slate-200 p-3 bg-slate-50/50 flex items-start justify-between text-xs rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="w-5 h-5 bg-[#0f5fc2] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 rounded">
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
                              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 text-xs block rounded">
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
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-xs space-y-2 rounded-lg">
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
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[360px]">
                      <Car className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No Route Selected</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Select a route from the pending or allocated queue on the left to view the manifest.
                      </p>
                    </div>
                  )}
                </div>

                {/* COLUMN 3: CABS AVAILABLE FOR ALLOCATION (Right 4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm p-5 space-y-4 min-h-[460px] rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Cabs</h3>
                    <span className="text-xs text-slate-400">Available Fleet Near Zone</span>
                  </div>

                  <div className="space-y-3">
                    {availableCabs.length > 0 ? (
                      availableCabs.map((cab) => (
                        <div key={cab.plate} className="border border-slate-200 p-3.5 hover:border-blue-400 transition-colors bg-white space-y-2 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 text-sm">{cab.plate}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
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
                              disabled={!currentSelectedRoute}
                              onClick={() => currentSelectedRoute && handleAllocateCabToRoute(currentSelectedRoute.routeId, cab)}
                              className="flex-1 bg-[#0f5fc2] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-1.5 text-xs transition-colors shadow-sm rounded-lg"
                            >
                              Allocate Cab
                            </button>
                            <a
                              href={`tel:${cab.phone}`}
                              className="p-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg"
                              title="Call Driver"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No cabs available for allocation in this zone.
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => showToast(`Opening Atharva Master Fleet Live Radar (${inPremiseVehicles.length} vehicles)...`)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 border border-slate-300 text-center rounded-lg"
                    >
                      View All {inPremiseVehicles.length} Depoted Fleet Vehicles
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
              <div className="bg-white border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 rounded-2xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#0f5fc2]">
                      MASS TRANSIT & SHUTTLE DISPATCH
                    </span>
                    <span className="bg-blue-100 text-[#0f5fc2] text-[10px] font-bold px-2 py-0.5 rounded">
                      8 FIXED CORRIDORS
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Bengaluru High-Capacity Corporate Bus & Tempo Corridors
                  </h2>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 rounded-lg">
                    Active Transporter: <strong>Atharva Travels Shuttle Fleet</strong>
                  </span>
                  <button
                    onClick={() => showToast('Bus telemetry synchronized with Bangalore traffic nodes!')}
                    className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Radar</span>
                  </button>
                </div>
              </div>

              {/* BUS SHUTTLE CARDS */}
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">No Active Shuttle Corridors Deployed</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Mass transit bus corridors and corporate shuttles will appear here when scheduled by the logistics transport desk.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: BUSINESS ANALYTICS VIEW                                            */}
          {/* ========================================================================= */}
          {activeHeaderTab === 'ANALYTICS' && (
            <div className="flex-1 flex flex-col bg-[#f4f7fb] p-6 space-y-6">
              <div className="bg-white border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 rounded-2xl">
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#0f5fc2] block">
                    COMMUTE SLA & ESG ANALYTICS
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Enterprise Bengaluru Commute Intelligence
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="bg-slate-100 border border-slate-300 px-3 py-1.5 font-bold text-slate-700 rounded-lg">
                    Reporting Window: Nov 2026
                  </span>
                  <button
                    onClick={() => showToast('Exporting executive SLA & ESG compliance report (PDF)...')}
                    className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 shadow-sm rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    On-Time Commute SLA
                  </span>
                  <div className="text-3xl font-black text-slate-400 mt-1">
                    {dbTrips.filter((t) => t.status === 'COMPLETED').length > 0 ? '100%' : '0%'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {dbTrips.filter((t) => t.status === 'COMPLETED').length > 0 ? 'Above 98.0% Contract Target' : 'No completed trips yet'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-sm rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Passenger Trips
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {dbTrips.filter((t) => t.status === 'COMPLETED').length}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Login: {dbTrips.filter((t) => t.status === 'COMPLETED' && t.type === 'LOGIN').length} • Logout: {dbTrips.filter((t) => t.status === 'COMPLETED' && t.type === 'LOGOUT').length}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-sm rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Carbon Saved (ESG Metric)
                  </span>
                  <div className="text-3xl font-black text-slate-700 mt-1">
                    {(dbTrips.filter((t) => t.status === 'COMPLETED').length * 0.12).toFixed(1)} kg
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Via Route Pooling &amp; EV Fleet
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-sm rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Zero Safety Incidents
                  </span>
                  <div className="text-3xl font-black text-emerald-700 mt-1">
                    {activeAlerts.length === 0 ? '100% Safe' : `${activeAlerts.length} Alerts`}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    {activeAlerts.length === 0 ? '0 Incidents Reported' : 'Active SOS in progress'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. BOTTOM STATUS FOOTER BAR */}
          <footer className="bg-white border-t border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsInPremiseModalOpen(true)}
                className="border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 px-3 py-1 text-slate-700 font-semibold text-xs flex items-center space-x-2 transition-colors bg-white shadow-xs cursor-pointer rounded-lg"
                title="Click to view vehicles inside campus premises"
              >
                <span>In premise vehicles</span>
                <span className="w-4 h-4 bg-[#0f5fc2] text-white flex items-center justify-center text-[10px] font-bold rounded-full">{inPremiseVehicles.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdhocTripsModalOpen(true)}
                className="border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 px-3 py-1 text-slate-700 font-semibold text-xs flex items-center space-x-2 transition-colors bg-white shadow-xs cursor-pointer rounded-lg"
                title="Click to view or create adhoc transport requests"
              >
                <span>Adhoc trips</span>
                <span className="w-4 h-4 bg-[#0f5fc2] text-white flex items-center justify-center text-[10px] font-bold rounded-full">0</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDelayedVehiclesModalOpen(true)}
                className="border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 px-3 py-1 text-slate-700 font-semibold text-xs flex items-center space-x-2 transition-colors bg-white shadow-xs cursor-pointer rounded-lg"
                title="Click to view delayed vehicles and SLA status"
              >
                <span>Delayed Vehicles</span>
                <span className="w-4 h-4 bg-[#0f5fc2] text-white flex items-center justify-center text-[10px] font-bold rounded-full">{delayedVehiclesList.length}</span>
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
      {/* 4. MODALS (Location Issue Reassignment & Password Reset)                   */}
      {/* ========================================================================= */}
      <LocationIssueModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        tripId={activeTripData?.tripId || 'TRIP-MAIN'}
        employeeId="emp-commuter"
        currentAddress={passengerState.pickupAddress}
        onLocationUpdated={(newAddress, newCoords) => {
          setPassengerState(prev => {
            const next = {
              ...prev,
              pickupAddress: newAddress,
              pickupCoords: newCoords,
              isReassigned: true,
              reassignmentReason: 'Reassigned via Employee/Admin portal',
            };
            setStoredItem(STORAGE_KEYS.PASSENGER_STATE, next);
            return next;
          });
          setIsLocationModalOpen(false);
          showToast(`Location reassigned to ${newAddress} and pushed to driver!`);
        }}
      />

      {/* MODAL: ADD EMPLOYEE (ADMIN EXCLUSIVE) */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 text-[#0f5fc2] flex items-center justify-center font-black">
                  <UserPlus className="w-4 h-4 text-[#0f5fc2]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Add New Employee</h3>
                  <p className="text-[11px] text-slate-500">Corporate Master Directory Entry (Admin Only)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEmployeeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={newEmployeeForm.fullName}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, fullName: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-9065"
                    value={newEmployeeForm.employeeCode}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, employeeCode: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul.v@enterprise.com"
                    value={newEmployeeForm.email}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98450 66778"
                    value={newEmployeeForm.phone}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Supply Chain Logistics Engineering"
                  value={newEmployeeForm.department}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                  className="w-full border border-slate-300 p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Home Pickup Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15th Cross, HSR Layout Sector 1, Bangalore"
                  value={newEmployeeForm.homeAddress}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, homeAddress: e.target.value })}
                  className="w-full border border-slate-300 p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Office Campus Hub</label>
                  <select
                    value={newEmployeeForm.officeCampus}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, officeCampus: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-medium text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Enterprise Tech Park, Tower B">Enterprise Tech Park, Tower B</option>
                    <option value="WalmartLabs Core Facility">WalmartLabs Core Facility</option>
                    <option value="Bellandur Tech Corridor">Bellandur Tech Corridor</option>
                    <option value="Main Campus Terminal">Main Campus Terminal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Shift Time</label>
                  <select
                    value={newEmployeeForm.defaultShiftTime}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, defaultShiftTime: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-medium text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="09:00">09:00 AM (Morning Login)</option>
                    <option value="10:30">10:30 AM (Standard Shift)</option>
                    <option value="13:30">13:30 PM (Midday Login)</option>
                    <option value="18:00">18:00 PM (Evening Logout)</option>
                    <option value="21:30">21:30 PM (Night Logout)</option>
                    <option value="22:30">22:30 PM (Late Shift)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <div className="flex items-center space-x-3">
                    {(['FEMALE', 'MALE', 'OTHER'] as const).map((g) => (
                      <label key={g} className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="new_emp_gender"
                          value={g}
                          checked={newEmployeeForm.gender === g}
                          onChange={() => setNewEmployeeForm({
                            ...newEmployeeForm,
                            gender: g,
                            femaleSafeguard: g === 'FEMALE',
                          })}
                        />
                        <span className="capitalize">{g.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={newEmployeeForm.femaleSafeguard}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, femaleSafeguard: e.target.checked })}
                      className="rounded"
                    />
                    <span>🛡️ Female Safeguard Protected</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmployee}
                  className="px-4 py-2 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  {isSubmittingEmployee ? 'Registering...' : '+ Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
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
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
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
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIGN OUT CONFIRMATION MODAL */}
      {isSignOutConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-sm w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Are you sure you want to sign out?
              </h3>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSignOutConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignOutConfirmOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: IN PREMISE VEHICLES MODAL */}
      {isInPremiseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-4xl w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Car className="w-5 h-5 text-[#0f5fc2]" />
                  <span>In Premise Depot Vehicles ({inPremiseVehicles.length} Active)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vehicles currently parked, staging, or standing by within campus holding bays.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInPremiseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-200 overflow-x-auto max-h-96 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Vehicle ID</th>
                    <th className="py-2.5 px-3">Registration No.</th>
                    <th className="py-2.5 px-3">Model / Capacity</th>
                    <th className="py-2.5 px-3">Driver Name</th>
                    <th className="py-2.5 px-3">Driver Contact Number</th>
                    <th className="py-2.5 px-3">Office / Gate</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {inPremiseVehicles.length > 0 ? (
                    inPremiseVehicles.map((cab: any) => (
                      <tr key={cab.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{cab.id}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{cab.plate}</td>
                        <td className="py-2.5 px-3 text-slate-600">{cab.model}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{cab.driver}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{cab.phone}</td>
                        <td className="py-2.5 px-3 text-slate-600">{cab.location}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setIsInPremiseModalOpen(false);
                              setDashboardMode('Operations');
                              setSearchVehicleInput(cab.plate);
                              showToast(`Focused vehicle ${cab.plate} on Operations radar`);
                            }}
                            className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-2.5 py-1 text-[11px] shadow-xs rounded-lg"
                          >
                            Track on Map
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No vehicles currently parked or staging in premise depot.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsInPremiseModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-1.5 text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADHOC TRIPS MODAL */}
      {isAdhocTripsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-[#0f5fc2]" />
                  <span>Adhoc & Emergency Transport Dispatch</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create immediate on-demand transport request for unscheduled employee commute.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdhocTripsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAdhocTripsModalOpen(false);
                showToast('🚨 Adhoc Emergency Trip dispatched successfully with Escort Marshal!');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee ID / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-9042 (Amrutha Rao)"
                  className="w-full border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commute Direction</label>
                  <select className="w-full border border-slate-300 px-3 py-1.5 bg-white font-medium">
                    <option value="LOGIN">LOGIN (To Campus)</option>
                    <option value="LOGOUT">LOGOUT (To Home)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office Campus</label>
                  <select className="w-full border border-slate-300 px-3 py-1.5 bg-white font-medium">
                    <option value="WalmartLabs">WalmartLabs</option>
                    <option value="Enterprise Tech Park">Enterprise Tech Park</option>
                    <option value="Corporate Central Hub">Corporate Central Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pickup / Drop Node</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar 100ft Road / Domlur Bridge"
                  className="w-full border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Adhoc Request</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Release Support / Medical Emergency"
                  className="w-full border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdhocTripsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Dispatch Adhoc Cab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELAYED VEHICLES AUDIT MODAL */}
      {isDelayedVehiclesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-4xl w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Delayed Fleet Vehicles ({delayedVehiclesList.length} Exceeding SLA)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live vehicles with ETA exceeding acceptable client contractual threshold (+10 mins).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDelayedVehiclesModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-200 overflow-x-auto max-h-96 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">Trip ID</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Current</th>
                    <th className="py-2.5 px-3">Delay</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Reason / Note</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {delayedVehiclesList.length > 0 ? (
                    delayedVehiclesList.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.plate}</td>
                        <td className="py-2.5 px-3 font-semibold">{row.driver}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-bold">{row.trip}</td>
                        <td className="py-2.5 px-3 text-slate-500">{row.exp}</td>
                        <td className="py-2.5 px-3 font-bold text-red-600">{row.curr}</td>
                        <td className="py-2.5 px-3 font-black text-red-700 bg-red-50">{row.delay}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.loc}</td>
                        <td className="py-2.5 px-3 text-slate-500 italic">{row.reason}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => showToast(`Calling ${row.driver} to re-route...`)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 text-[11px] rounded-lg"
                          >
                            Contact Driver
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                        No delayed vehicles reported. All scheduled trips are operating within contractual SLA limits.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDelayedVehiclesModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-1.5 text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DEDICATED INCOMPLETE TRIPS SCREEN / VIEW */}
      {isIncompleteTripsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-5xl w-full p-6 space-y-4 rounded-2xl">
            
            {/* Header: ← Incomplete Trips */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsIncompleteTripsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-700 transition-colors flex items-center space-x-1 rounded-lg"
                  title="Return to Main Operations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                    <span>Incomplete Trips</span>
                    <span className="bg-[#ff4d4f] text-white text-[10px] font-bold px-2 py-0.5 uppercase rounded-md">
                      {incompleteTripsList.length} Trip{incompleteTripsList.length === 1 ? '' : 's'} Requiring Intervention
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operations Exception Console: Trips with delayed chauffeur arrival, route deviation, or escort unverified.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIncompleteTripsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 border border-slate-200 text-xs font-semibold rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select className="border border-slate-300 bg-white py-1.5 pl-3 pr-7 text-xs font-bold text-slate-800 appearance-none focus:outline-none rounded-lg">
                    <option value="1">Incomplete Trips ({incompleteTripsList.length})</option>
                    <option value="all">All Exceptions</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Trip ID"
                    className="border border-slate-300 bg-white py-1.5 pl-7 pr-3 text-xs w-52 placeholder:text-slate-400 focus:outline-none rounded-lg"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                </div>

                <div className="relative">
                  <select className="border border-slate-300 bg-white py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-700 appearance-none focus:outline-none rounded-lg">
                    <option value="all">All Issues</option>
                    <option value="delayed">Delayed &gt; 10m</option>
                    <option value="escort">Missing Marshal</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsIncompleteTripsModalOpen(false);
                    setDashboardMode('Operations');
                    showToast('Displaying active trips on Google Maps radar');
                  }}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 shadow-xs flex items-center space-x-1.5 rounded-lg"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View On Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Incomplete trips: Trips that failed to start within 15 mins of planned shift time.')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-300 bg-white rounded-lg"
                  title="Policy Information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table of Incomplete Trips */}
            <div className="border border-slate-200 overflow-x-auto rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Trip ID</th>
                    <th className="py-2.5 px-3">Shift & Dir</th>
                    <th className="py-2.5 px-3">Vehicle Plate</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">Route Node</th>
                    <th className="py-2.5 px-3">Scheduled</th>
                    <th className="py-2.5 px-3">Issue Reason</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {incompleteTripsList.length > 0 ? (
                    incompleteTripsList.map((trip: any) => (
                      <tr key={trip.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-red-700">{trip.tripCode || trip.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800">{trip.shiftTime}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 ml-1 rounded">
                            {trip.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{trip.vehicle?.plateNumber}</td>
                        <td className="py-3 px-3">{trip.driver?.fullName} ({trip.driver?.phone})</td>
                        <td className="py-3 px-3 text-slate-600">{trip.routeName}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{trip.scheduledStartTime || trip.shiftTime}</td>
                        <td className="py-3 px-3">
                          <span className="text-[#cf1322] font-semibold bg-[#fff1f0] border border-[#ffa39e] px-2 py-0.5 text-[10px] block w-fit rounded">
                            Pending Departure / Boarding Incomplete
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setIsIncompleteTripsModalOpen(false);
                              showToast(`Triaged trip ${trip.tripCode || trip.id}!`);
                            }}
                            className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1 text-xs shadow-xs rounded-lg"
                          >
                            Reassign Cab
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                        No incomplete trips. All active and scheduled trips are cleared.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsIncompleteTripsModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-1.5 text-xs rounded-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: 24/7 SUPPORT MODAL */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[#0f5fc2]" />
                <h3 className="text-base font-black text-slate-900">
                  Atharva 24/7 Operations Desk Support
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="text-slate-500">
                Direct hotline to Bengaluru Transport Control Command for drivers, vendor leads, and corporate enterprise desk managers.
              </p>

              <div className="bg-slate-50 p-3 border border-slate-200 space-y-2 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">24x7 Emergency Helpline</span>
                  <a href="tel:+918049652100" className="text-sm font-black text-blue-700 hover:underline">
                    +91 80 4965 2100 / +91 98450 11223
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Operations Dispatch Email</span>
                  <a href="mailto:ops@atharvatravels.com" className="text-xs font-semibold text-slate-800 hover:underline">
                    ops@atharvatravels.com
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp Fleet Bot</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">+91 98765 43210</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-4 py-1.5 text-xs shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DRIVER MOBILE TERMINAL VIEW */}
      {viewState === 'driver-app' && (
        <DriverMobileApp
          onSwitchPortal={(portal) => setViewState(portal)}
        />
      )}

      {/* 5. EMPLOYEE COMMUTER APP VIEW */}
      {viewState === 'employee-app' && (
        <EmployeeMobileApp
          onSwitchPortal={(portal) => setViewState(portal)}
        />
      )}

    </div>
  );
}
