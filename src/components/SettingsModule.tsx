'use client';

import React, { useState, useEffect } from 'react';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/lib/storage';
import {
  FileText,
  PlusCircle,
  Car,
  UserCheck,
  ShieldCheck,
  Cpu,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  FileCheck,
  Shield,
  Radio,
  RefreshCw,
  X,
  Sliders,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
  Wrench,
  Fuel,
  MapPin,
  Calendar,
  Lock,
  Building2,
  DollarSign,
  Activity,
  Layers,
  Users,
  KeyRound,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';

export type SettingsSubTab =
  | 'VEHICLE_CONTRACTS'
  | 'MANAGE_NEW_CONTRACTS'
  | 'MANAGE_VEHICLES'
  | 'MANAGE_DRIVERS'
  | 'MANAGE_COMPLIANCE'
  | 'MANAGE_FIXED_DEVICES'
  | 'MANAGE_VENDOR_ACCESS';

interface SettingsModuleProps {
  initialSubTab?: SettingsSubTab;
  onSubTabChange?: (tab: SettingsSubTab) => void;
  showToast: (message: string) => void;
  currentUserRole?: string;
}

// ---------------------------------------------------------------------------
// DATA MODELS & INITIAL SETS (Atharva Travels Central Fleet Operations)
// ---------------------------------------------------------------------------

interface ContractRecord {
  id: string;
  code: string;
  title: string;
  transporter: string;
  clientPartner: string;
  vehicleCategory: string;
  vehicleQuota: number;
  monthlyBaseKm: number;
  monthlyBaseRental: number;
  extraKmRate: number;
  extraHourRate: number;
  nightEscortAllowance: number;
  validFrom: string;
  validTo: string;
  billingCycle: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'DRAFT' | 'TERMINATED';
  slaOnTimeThreshold: string;
}

const INITIAL_CONTRACTS: ContractRecord[] = [
  {
    id: 'cnt-1',
    code: 'CNT-2026-ATH-01',
    title: 'Atharva Dedicated SUV Executive Commute',
    transporter: 'Atharva Travels Pvt Ltd',
    clientPartner: 'Nexus Global Enterprise Tech',
    vehicleCategory: 'SUV 7-Seater (Toyota Innova Crysta)',
    vehicleQuota: 24,
    monthlyBaseKm: 2500,
    monthlyBaseRental: 48500,
    extraKmRate: 14.5,
    extraHourRate: 85.0,
    nightEscortAllowance: 450,
    validFrom: '01 Jan 2026',
    validTo: '31 Dec 2026',
    billingCycle: 'Monthly (Net-30)',
    status: 'ACTIVE',
    slaOnTimeThreshold: '98.5%',
  },
  {
    id: 'cnt-2',
    code: 'CNT-2026-ATH-02',
    title: 'Atharva Mid-Size Sedan Corridor Shuttle',
    transporter: 'Atharva Travels Pvt Ltd',
    clientPartner: 'Nexus Global Enterprise Tech',
    vehicleCategory: 'Sedan 4-Seater (Maruti Dzire)',
    vehicleQuota: 14,
    monthlyBaseKm: 2200,
    monthlyBaseRental: 34200,
    extraKmRate: 11.0,
    extraHourRate: 65.0,
    nightEscortAllowance: 450,
    validFrom: '01 Jan 2026',
    validTo: '31 Dec 2026',
    billingCycle: 'Monthly (Net-30)',
    status: 'ACTIVE',
    slaOnTimeThreshold: '98.0%',
  },
  {
    id: 'cnt-3',
    code: 'CNT-2026-ATH-03',
    title: 'Atharva Mass Transit Feeder & Bus Service',
    transporter: 'Atharva Travels Pvt Ltd',
    clientPartner: 'Nexus Global Enterprise Tech',
    vehicleCategory: 'Tempo Traveller (12+1 Force Traveller)',
    vehicleQuota: 4,
    monthlyBaseKm: 3000,
    monthlyBaseRental: 68000,
    extraKmRate: 18.0,
    extraHourRate: 120.0,
    nightEscortAllowance: 0,
    validFrom: '15 Feb 2026',
    validTo: '14 Feb 2027',
    billingCycle: 'Monthly (Net-30)',
    status: 'ACTIVE',
    slaOnTimeThreshold: '99.0%',
  },
  {
    id: 'cnt-4',
    code: 'CNT-2025-ATH-08',
    title: 'Atharva Green EV Zero-Emission Commute Pilot',
    transporter: 'Atharva Travels Pvt Ltd',
    clientPartner: 'Apex Cloud Systems',
    vehicleCategory: 'Electric Vehicle (Tata Tigor EV)',
    vehicleQuota: 6,
    monthlyBaseKm: 2000,
    monthlyBaseRental: 38000,
    extraKmRate: 9.5,
    extraHourRate: 70.0,
    nightEscortAllowance: 450,
    validFrom: '01 Nov 2025',
    validTo: '30 Nov 2026',
    billingCycle: 'Monthly (Net-30)',
    status: 'EXPIRING_SOON',
    slaOnTimeThreshold: '97.5%',
  },
];

interface VehicleRecord {
  id: string;
  plate: string;
  model: string;
  category: 'SUV' | 'Sedan' | 'Tempo' | 'EV';
  seatingCapacity: string;
  fuelType: string;
  driverName: string;
  driverPhone: string;
  rcExpiry: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  pucExpiry: string;
  speedGovernorCert: string;
  gpsDeviceId: string;
  status: 'ACTIVE_ROUTE' | 'DEPOT_STANDBY' | 'MAINTENANCE' | 'DOCS_DUE';
}

const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: 'v-1',
    plate: 'KA-03-HA-8821',
    model: 'Toyota Innova Crysta',
    category: 'SUV',
    seatingCapacity: '6+1',
    fuelType: 'Diesel',
    driverName: 'Suresh Babu',
    driverPhone: '+91 98765 43210',
    rcExpiry: '14-Aug-2028',
    insurancePolicy: 'Bajaj Allianz Commercial #BA-99410',
    insuranceExpiry: '12-Oct-2027',
    fitnessExpiry: '14-Aug-2028',
    pucExpiry: '30-Apr-2027',
    speedGovernorCert: 'SLD-KA03-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-8821',
    status: 'ACTIVE_ROUTE',
  },
  {
    id: 'v-2',
    plate: 'KA-05-MJ-4310',
    model: 'Toyota Innova Crysta',
    category: 'SUV',
    seatingCapacity: '6+1',
    fuelType: 'Diesel',
    driverName: 'Mahesh Gowda',
    driverPhone: '+91 98450 77112',
    rcExpiry: '20-May-2027',
    insurancePolicy: 'ICICI Lombard Commercial #IL-88129',
    insuranceExpiry: '18-Jan-2027',
    fitnessExpiry: '20-May-2027',
    pucExpiry: '15-Jun-2027',
    speedGovernorCert: 'SLD-KA05-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-4310',
    status: 'ACTIVE_ROUTE',
  },
  {
    id: 'v-3',
    plate: 'KA-01-EQ-9011',
    model: 'Maruti Dzire Tour S',
    category: 'Sedan',
    seatingCapacity: '4+1',
    fuelType: 'CNG / Petrol',
    driverName: 'Venkatesh R.',
    driverPhone: '+91 97400 33881',
    rcExpiry: '10-Nov-2027',
    insurancePolicy: 'Tata AIG Commercial #TA-44910',
    insuranceExpiry: '05-Dec-2026',
    fitnessExpiry: '10-Nov-2027',
    pucExpiry: '12-Feb-2027',
    speedGovernorCert: 'SLD-KA01-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-9011',
    status: 'DEPOT_STANDBY',
  },
  {
    id: 'v-4',
    plate: 'KA-53-B-7712',
    model: 'Maruti Dzire Tour S',
    category: 'Sedan',
    seatingCapacity: '4+1',
    fuelType: 'Diesel',
    driverName: 'Naveen Kumar',
    driverPhone: '+91 98860 11299',
    rcExpiry: '19-Sep-2028',
    insurancePolicy: 'New India Assurance #NI-33219',
    insuranceExpiry: '30-Sep-2027',
    fitnessExpiry: '19-Sep-2028',
    pucExpiry: '25-Aug-2027',
    speedGovernorCert: 'SLD-KA53-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-7712',
    status: 'ACTIVE_ROUTE',
  },
  {
    id: 'v-5',
    plate: 'KA-04-E-6620',
    model: 'Force Traveller Shuttle',
    category: 'Tempo',
    seatingCapacity: '12+1',
    fuelType: 'Diesel',
    driverName: 'Basavaraj M.',
    driverPhone: '+91 99000 44551',
    rcExpiry: '02-Jan-2028',
    insurancePolicy: 'Reliance Commercial #RC-77218',
    insuranceExpiry: '15-Mar-2027',
    fitnessExpiry: '02-Jan-2028',
    pucExpiry: '10-May-2027',
    speedGovernorCert: 'SLD-KA04-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-6620',
    status: 'ACTIVE_ROUTE',
  },
  {
    id: 'v-6',
    plate: 'KA-02-AB-3391',
    model: 'Tata Tigor EV Pro',
    category: 'EV',
    seatingCapacity: '4+1',
    fuelType: 'Electric',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 96111 88220',
    rcExpiry: '28-Feb-2029',
    insurancePolicy: 'HDFC ERGO Commercial #HE-99182',
    insuranceExpiry: '20-Nov-2026',
    fitnessExpiry: '28-Feb-2029',
    pucExpiry: 'Exempt (Electric)',
    speedGovernorCert: 'SLD-KA02-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-3391',
    status: 'DEPOT_STANDBY',
  },
  {
    id: 'v-7',
    plate: 'KA-03-MK-5120',
    model: 'Toyota Innova Crysta',
    category: 'SUV',
    seatingCapacity: '6+1',
    fuelType: 'Diesel',
    driverName: 'Anand Swamy',
    driverPhone: '+91 98440 22339',
    rcExpiry: '11-Jul-2027',
    insurancePolicy: 'Bajaj Allianz Commercial #BA-11204',
    insuranceExpiry: '25-Nov-2026',
    fitnessExpiry: '11-Jul-2027',
    pucExpiry: '19-Jan-2027',
    speedGovernorCert: 'SLD-KA03-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-5120',
    status: 'DOCS_DUE',
  },
  {
    id: 'v-8',
    plate: 'KA-05-NB-9044',
    model: 'Force Traveller Shuttle',
    category: 'Tempo',
    seatingCapacity: '12+1',
    fuelType: 'Diesel',
    driverName: 'Praveen K.',
    driverPhone: '+91 97311 00299',
    rcExpiry: '04-Apr-2028',
    insurancePolicy: 'IFFCO-Tokio Commercial #IT-66102',
    insuranceExpiry: '08-May-2027',
    fitnessExpiry: '04-Apr-2028',
    pucExpiry: '01-Jun-2027',
    speedGovernorCert: 'SLD-KA05-60KMPH-PASS',
    gpsDeviceId: 'AIS-140-9044',
    status: 'DEPOT_STANDBY',
  },
];

interface DriverRecord {
  id: string;
  staffCode: string;
  name: string;
  phone: string;
  dlNumber: string;
  dlExpiry: string;
  badgeNumber: string;
  policeBvcStatus: 'VERIFIED' | 'IN_RENEWAL' | 'PENDING';
  policeBvcCert: string;
  medicalFitness: 'PASSED' | 'DUE';
  eyeTestDate: string;
  trainingStatus: 'CERTIFIED' | 'REFRESHER_DUE';
  assignedCabPlate: string;
  totalTrips: number;
  rating: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'COMPLIANCE_REVIEW';
}

const INITIAL_DRIVERS: DriverRecord[] = [
  {
    id: 'd-1',
    staffCode: 'ATH-DRV-101',
    name: 'Suresh Babu',
    phone: '+91 98765 43210',
    dlNumber: 'KA0320140029101',
    dlExpiry: '22-Mar-2030',
    badgeNumber: 'PSV-BLR-88412',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9921',
    medicalFitness: 'PASSED',
    eyeTestDate: '05-Jan-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-03-HA-8821',
    totalTrips: 1420,
    rating: 4.9,
    status: 'ACTIVE',
  },
  {
    id: 'd-2',
    staffCode: 'ATH-DRV-102',
    name: 'Mahesh Gowda',
    phone: '+91 98450 77112',
    dlNumber: 'KA0520160018442',
    dlExpiry: '15-Aug-2031',
    badgeNumber: 'PSV-BLR-88413',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9922',
    medicalFitness: 'PASSED',
    eyeTestDate: '12-Feb-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-05-MJ-4310',
    totalTrips: 1180,
    rating: 4.8,
    status: 'ACTIVE',
  },
  {
    id: 'd-3',
    staffCode: 'ATH-DRV-103',
    name: 'Venkatesh R.',
    phone: '+91 97400 33881',
    dlNumber: 'KA0120120045199',
    dlExpiry: '10-Nov-2028',
    badgeNumber: 'PSV-BLR-88414',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9923',
    medicalFitness: 'PASSED',
    eyeTestDate: '20-Jan-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-01-EQ-9011',
    totalTrips: 2040,
    rating: 4.95,
    status: 'ACTIVE',
  },
  {
    id: 'd-4',
    staffCode: 'ATH-DRV-104',
    name: 'Naveen Kumar',
    phone: '+91 98860 11299',
    dlNumber: 'KA5320180009121',
    dlExpiry: '19-Sep-2033',
    badgeNumber: 'PSV-BLR-88415',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9924',
    medicalFitness: 'PASSED',
    eyeTestDate: '02-Mar-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-53-B-7712',
    totalTrips: 890,
    rating: 4.7,
    status: 'ACTIVE',
  },
  {
    id: 'd-5',
    staffCode: 'ATH-DRV-105',
    name: 'Basavaraj M.',
    phone: '+91 99000 44551',
    dlNumber: 'KA0420100088120',
    dlExpiry: '02-Jan-2029',
    badgeNumber: 'PSV-BLR-88416',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9925',
    medicalFitness: 'PASSED',
    eyeTestDate: '18-Feb-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-04-E-6620',
    totalTrips: 2510,
    rating: 4.9,
    status: 'ACTIVE',
  },
  {
    id: 'd-6',
    staffCode: 'ATH-DRV-106',
    name: 'Ramesh Kumar',
    phone: '+91 96111 88220',
    dlNumber: 'KA0220190033100',
    dlExpiry: '28-Feb-2034',
    badgeNumber: 'PSV-BLR-88417',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9926',
    medicalFitness: 'PASSED',
    eyeTestDate: '10-Jan-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-02-AB-3391',
    totalTrips: 640,
    rating: 4.85,
    status: 'ACTIVE',
  },
  {
    id: 'd-7',
    staffCode: 'ATH-DRV-107',
    name: 'Anand Swamy',
    phone: '+91 98440 22339',
    dlNumber: 'KA0320150044182',
    dlExpiry: '11-Jul-2030',
    badgeNumber: 'PSV-BLR-88418',
    policeBvcStatus: 'IN_RENEWAL',
    policeBvcCert: 'EXP-NOV-2026',
    medicalFitness: 'DUE',
    eyeTestDate: 'Due for Test',
    trainingStatus: 'REFRESHER_DUE',
    assignedCabPlate: 'KA-03-MK-5120',
    totalTrips: 930,
    rating: 4.6,
    status: 'COMPLIANCE_REVIEW',
  },
  {
    id: 'd-8',
    staffCode: 'ATH-DRV-108',
    name: 'Praveen K.',
    phone: '+91 97311 00299',
    dlNumber: 'KA0520170067201',
    dlExpiry: '04-Apr-2032',
    badgeNumber: 'PSV-BLR-88419',
    policeBvcStatus: 'VERIFIED',
    policeBvcCert: 'BVC-KA-2025-9928',
    medicalFitness: 'PASSED',
    eyeTestDate: '25-Feb-2026',
    trainingStatus: 'CERTIFIED',
    assignedCabPlate: 'KA-05-NB-9044',
    totalTrips: 1340,
    rating: 4.8,
    status: 'ON_LEAVE',
  },
];

interface ComplianceRule {
  id: string;
  name: string;
  category: 'SAFETY' | 'LEGAL' | 'TELEMETRY' | 'DISPATCH';
  description: string;
  mandatedBy: string;
  penaltyOnViolation: string;
  enabled: boolean;
  complianceRate: string;
}

const INITIAL_RULES: ComplianceRule[] = [
  {
    id: 'rule-1',
    name: 'Mandatory Armed Security Escort for Female Commuters (20:00 - 06:00)',
    category: 'SAFETY',
    description: 'Trained and background-verified security escort guard must accompany all night trips carrying female employees.',
    mandatedBy: 'Govt of Karnataka Transport Dept & POSH Workplace Rules',
    penaltyOnViolation: 'Trip Cancellation + ₹5,000 Vendor Penalty',
    enabled: true,
    complianceRate: '100%',
  },
  {
    id: 'rule-2',
    name: 'First Pickup / Last Drop Female Safety Protocol',
    category: 'SAFETY',
    description: 'Female employees must never be the solitary first passenger picked up before 06:00 or last passenger dropped after 20:00.',
    mandatedBy: 'Corporate Workplace Safety & Transport Standards',
    penaltyOnViolation: 'Mandatory Escort Guard Deployment Flagged',
    enabled: true,
    complianceRate: '100%',
  },
  {
    id: 'rule-3',
    name: 'Karnataka Police Criminal Background Verification (BVC)',
    category: 'LEGAL',
    description: 'Driver must possess valid 100% police verification certificate before being rostered onto any corporate route.',
    mandatedBy: 'Bengaluru City Police Commute Advisory & RTO',
    penaltyOnViolation: 'Immediate Driver De-rostering',
    enabled: true,
    complianceRate: '97.9%',
  },
  {
    id: 'rule-4',
    name: 'AIS-140 Electronic Speed Governor (Speed Locked to 60 km/h)',
    category: 'TELEMETRY',
    description: 'Speed Limiter Device (SLD) calibration certificate mandatory. Speed alerts fired if vehicle exceeds 60 km/h for >10 sec.',
    mandatedBy: 'Ministry of Road Transport & Highways (MoRTH)',
    penaltyOnViolation: 'Automatic Operations Center Red Alarm',
    enabled: true,
    complianceRate: '100%',
  },
  {
    id: 'rule-5',
    name: 'Daily Depot Gate Alcohol Breathalyzer Test',
    category: 'DISPATCH',
    description: 'Depot security conducts 0.00% BAC digital breathalyzer screening before handing over route trip sheets.',
    mandatedBy: 'Corporate ETS Fleet Operation Standard',
    penaltyOnViolation: 'Immediate Chauffeur Suspension & Cab Hold',
    enabled: true,
    complianceRate: '100%',
  },
  {
    id: 'rule-6',
    name: 'Dual In-Cab Panic SOS Physical Button 24-Hour Heartbeat',
    category: 'TELEMETRY',
    description: 'Driver dashboard and passenger rear-seat panic switches must ping the telemetry backend daily.',
    mandatedBy: 'MoveInSync Safety Standard & AIS-140 Mandate',
    penaltyOnViolation: 'Cab Blacklisted from Route Allocation',
    enabled: true,
    complianceRate: '98.8%',
  },
  {
    id: 'rule-7',
    name: 'Real-Time Geofence Route Deviation Sentinel (> 300m)',
    category: 'TELEMETRY',
    description: 'Alert triggers on transport control room if driver diverges more than 300 meters from optimized polyline.',
    mandatedBy: 'Atharva Central Operations Command Center',
    penaltyOnViolation: 'TCR Control Room In-cab Audio Intercom Call',
    enabled: true,
    complianceRate: '99.4%',
  },
];

interface FixedDeviceRecord {
  id: string;
  imei: string;
  deviceType: 'AIS_140_GPS' | 'PANIC_SOS_BUTTON' | 'DRIVER_MDT_TABLET' | 'RFID_CARD_TAP';
  mappedPlate: string;
  transporter: string;
  simCarrier: string;
  signalStrength: string;
  supplyVoltage: string;
  lastHeartbeat: string;
  firmware: string;
  diagnosticHealth: 'ONLINE' | 'STANDBY' | 'WEAK_SIGNAL' | 'ALERT';
}

const INITIAL_DEVICES: FixedDeviceRecord[] = [
  {
    id: 'dev-1',
    imei: '864912048821901',
    deviceType: 'AIS_140_GPS',
    mappedPlate: 'KA-03-HA-8821',
    transporter: 'Atharva Travels',
    simCarrier: 'Airtel IoT 4G M2M',
    signalStrength: '-72 dBm (Excellent)',
    supplyVoltage: '13.8V (Alternator)',
    lastHeartbeat: '6 secs ago',
    firmware: 'v3.4.12-sec-morth',
    diagnosticHealth: 'ONLINE',
  },
  {
    id: 'dev-2',
    imei: '864912048821902',
    deviceType: 'PANIC_SOS_BUTTON',
    mappedPlate: 'KA-03-HA-8821',
    transporter: 'Atharva Travels',
    simCarrier: 'Hardware Wired Bus',
    signalStrength: 'Direct Loop (OK)',
    supplyVoltage: '12V Constant',
    lastHeartbeat: '1 min ago (Test OK)',
    firmware: 'v1.2.0-sos-dual',
    diagnosticHealth: 'ONLINE',
  },
  {
    id: 'dev-3',
    imei: '864912048821903',
    deviceType: 'DRIVER_MDT_TABLET',
    mappedPlate: 'KA-03-HA-8821',
    transporter: 'Atharva Travels',
    simCarrier: 'Jio 5G Enterprise',
    signalStrength: '-68 dBm (5G SA)',
    supplyVoltage: '94% Battery / Charging',
    lastHeartbeat: '2 secs ago',
    firmware: 'Android 14 (Knox MDM)',
    diagnosticHealth: 'ONLINE',
  },
  {
    id: 'dev-4',
    imei: '864912044310882',
    deviceType: 'AIS_140_GPS',
    mappedPlate: 'KA-05-MJ-4310',
    transporter: 'Atharva Travels',
    simCarrier: 'Airtel IoT 4G M2M',
    signalStrength: '-76 dBm (Good)',
    supplyVoltage: '13.7V (Alternator)',
    lastHeartbeat: '11 secs ago',
    firmware: 'v3.4.12-sec-morth',
    diagnosticHealth: 'ONLINE',
  },
  {
    id: 'dev-5',
    imei: '864912049011771',
    deviceType: 'AIS_140_GPS',
    mappedPlate: 'KA-01-EQ-9011',
    transporter: 'Atharva Travels',
    simCarrier: 'Vodafone Idea M2M',
    signalStrength: '-84 dBm (Moderate)',
    supplyVoltage: '12.6V (Standby Depot)',
    lastHeartbeat: '45 secs ago',
    firmware: 'v3.4.11',
    diagnosticHealth: 'STANDBY',
  },
  {
    id: 'dev-6',
    imei: '864912047712330',
    deviceType: 'AIS_140_GPS',
    mappedPlate: 'KA-53-B-7712',
    transporter: 'Atharva Travels',
    simCarrier: 'Airtel IoT 4G M2M',
    signalStrength: '-74 dBm (Good)',
    supplyVoltage: '13.9V (Alternator)',
    lastHeartbeat: '14 secs ago',
    firmware: 'v3.4.12-sec-morth',
    diagnosticHealth: 'ONLINE',
  },
  {
    id: 'dev-7',
    imei: '864912046620551',
    deviceType: 'RFID_CARD_TAP',
    mappedPlate: 'KA-04-E-6620',
    transporter: 'Atharva Travels',
    simCarrier: 'Hardware CAN-Bus',
    signalStrength: '13.56 MHz NFC (OK)',
    supplyVoltage: '5V Regulated',
    lastHeartbeat: '22 secs ago',
    firmware: 'v2.1.0-rfid',
    diagnosticHealth: 'ONLINE',
  },
  {
    id: 'dev-8',
    imei: '864912043391202',
    deviceType: 'AIS_140_GPS',
    mappedPlate: 'KA-02-AB-3391',
    transporter: 'Atharva Travels',
    simCarrier: 'Airtel IoT 4G M2M',
    signalStrength: '-92 dBm (Depot Basement)',
    supplyVoltage: 'EV Auxiliary 12.8V',
    lastHeartbeat: '2 mins ago',
    firmware: 'v3.4.12-sec-morth',
    diagnosticHealth: 'WEAK_SIGNAL',
  },
];

// ---------------------------------------------------------------------------
// ADMIN ACCESS CONTROL: VENDOR & TEAM ACCESS MANAGEMENT MODEL
// Super Admin is Main: Creates & Grants Access to Vendors & Vendor Teams
// ---------------------------------------------------------------------------

export interface ManagedVendorAccessUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  aliasCode: string;
  vendorCompany: string;
  userType: 'PRIMARY_VENDOR' | 'VENDOR_TEAM_MEMBER';
  roleTitle: string;
  authorizedByAdmin: string;
  isAccessGranted: boolean;
  permissions: {
    canAllocateCabs: boolean;
    canViewRadar: boolean;
    canRequestAdhoc: boolean;
    canViewBilling: boolean;
    canManageRoster: boolean;
  };
  lastLogin: string;
}

const INITIAL_VENDOR_ACCESS_USERS: ManagedVendorAccessUser[] = [
  {
    id: 'vnd-user-1',
    name: 'Arjun Nambiar',
    email: 'vendor.lead@enterprise.internal',
    phone: '+91 98450 11990',
    aliasCode: 'VND-CORP-01',
    vendorCompany: 'Nexus Global Enterprise Tech',
    userType: 'PRIMARY_VENDOR',
    roleTitle: 'Head of Workplace Mobility (Primary Vendor)',
    authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: true,
      canViewRadar: true,
      canRequestAdhoc: true,
      canViewBilling: true,
      canManageRoster: true,
    },
    lastLogin: 'Today, 14:12',
  },
  {
    id: 'vnd-user-2',
    name: 'Ananya Verma',
    email: 'transport.coord@enterprise.internal',
    phone: '+91 98711 55443',
    aliasCode: 'VND-TEAM-01',
    vendorCompany: 'Nexus Global Enterprise Tech',
    userType: 'VENDOR_TEAM_MEMBER',
    roleTitle: 'Shift Commute Operations Coordinator (Vendor Team)',
    authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: true,
      canViewRadar: true,
      canRequestAdhoc: true,
      canViewBilling: false, // Restricted by admin
      canManageRoster: true,
    },
    lastLogin: 'Today, 11:45',
  },
  {
    id: 'vnd-user-3',
    name: 'Karthik Sundaram',
    email: 'helpdesk@enterprise.internal',
    phone: '+91 99160 88210',
    aliasCode: 'VND-TEAM-02',
    vendorCompany: 'Nexus Global Enterprise Tech',
    userType: 'VENDOR_TEAM_MEMBER',
    roleTitle: 'Employee Commute Helpdesk Lead (Vendor Team)',
    authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: false, // Restricted by admin
      canViewRadar: true,
      canRequestAdhoc: true,
      canViewBilling: false, // Restricted by admin
      canManageRoster: false,
    },
    lastLogin: 'Yesterday, 18:30',
  },
  {
    id: 'vnd-user-4',
    name: 'Pooja Hegde',
    email: 'safety.officer@enterprise.internal',
    phone: '+91 98455 33211',
    aliasCode: 'VND-TEAM-03',
    vendorCompany: 'Nexus Global Enterprise Tech',
    userType: 'VENDOR_TEAM_MEMBER',
    roleTitle: 'Escort & Night Safety Supervisor (Vendor Team)',
    authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: false,
      canViewRadar: true,
      canRequestAdhoc: false,
      canViewBilling: false,
      canManageRoster: true,
    },
    lastLogin: 'Today, 06:15',
  },
  {
    id: 'vnd-user-5',
    name: 'Rohan Mehra',
    email: 'billing.audit@enterprise.internal',
    phone: '+91 98860 99441',
    aliasCode: 'VND-TEAM-04',
    vendorCompany: 'Nexus Global Enterprise Tech',
    userType: 'VENDOR_TEAM_MEMBER',
    roleTitle: 'Commute Billing & Kilometric Auditor (Vendor Team)',
    authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: false,
      canViewRadar: false,
      canRequestAdhoc: false,
      canViewBilling: true, // Specifically permitted by admin
      canManageRoster: false,
    },
    lastLogin: '08 Nov 2026',
  },
];

export function SettingsModule({
  initialSubTab = 'VEHICLE_CONTRACTS',
  onSubTabChange,
  showToast,
  currentUserRole = 'ATHARVA_ADMIN',
}: SettingsModuleProps) {
  const [currentTab, setCurrentTab] = useState<SettingsSubTab>(initialSubTab);

  // Synced tab changer
  const handleTabSelect = (tab: SettingsSubTab) => {
    setCurrentTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // State: Contracts
  const [contractsList, setContractsList] = useState<ContractRecord[]>(INITIAL_CONTRACTS);
  const [contractSearchQuery, setContractSearchQuery] = useState('');
  const [contractCategoryFilter, setContractCategoryFilter] = useState('ALL');
  const [selectedContractForModal, setSelectedContractForModal] = useState<ContractRecord | null>(null);

  // State: New Contract Wizard Form
  const [newContractForm, setNewContractForm] = useState({
    code: `CNT-2026-ATH-0${contractsList.length + 1}`,
    title: 'Atharva Corporate Campus Rapid Dispatch Slabs',
    transporter: 'Atharva Travels Pvt Ltd',
    clientPartner: 'Nexus Global Enterprise Tech',
    vehicleCategory: 'SUV 7-Seater (Toyota Innova Crysta)',
    vehicleQuota: 10,
    monthlyBaseKm: 2500,
    monthlyBaseRental: 48500,
    extraKmRate: 14.5,
    extraHourRate: 85.0,
    nightEscortAllowance: 450,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    billingCycle: 'Monthly (Net-30)',
    statutoryAis140: true,
    statutoryBvc: true,
    statutorySpeedGov: true,
    statutoryEscort: true,
  });

  // State: Vehicles
  const [vehiclesList, setVehiclesList] = useState<VehicleRecord[]>(INITIAL_VEHICLES);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('ALL');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('ALL');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState({
    plate: '',
    model: 'Toyota Innova Crysta',
    category: 'SUV' as 'SUV' | 'Sedan' | 'Tempo' | 'EV',
    seatingCapacity: '6+1',
    fuelType: 'Diesel',
    driverName: '',
    driverPhone: '',
    rcExpiry: '2028-12-31',
    insurancePolicy: 'Bajaj Allianz Commercial',
    insuranceExpiry: '2027-10-31',
    fitnessExpiry: '2028-12-31',
    pucExpiry: '2027-06-30',
    speedGovernorCert: 'SLD-60KMPH-CERT',
    gpsDeviceId: '',
  });

  // State: Drivers
  const [driversList, setDriversList] = useState<DriverRecord[]>(INITIAL_DRIVERS);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('ALL');
  const [driverBvcFilter, setDriverBvcFilter] = useState('ALL');
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriverForm, setNewDriverForm] = useState({
    staffCode: `ATH-DRV-${100 + driversList.length + 1}`,
    name: '',
    phone: '',
    dlNumber: '',
    dlExpiry: '2032-12-31',
    badgeNumber: '',
    policeBvcCert: '',
    assignedCabPlate: '',
  });

  // State: Compliance Rules
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(INITIAL_RULES);

  // State: Fixed Devices
  const [fixedDevices, setFixedDevices] = useState<FixedDeviceRecord[]>(INITIAL_DEVICES);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');
  const [pingingDeviceId, setPingingDeviceId] = useState<string | null>(null);

  // State: ADMIN ACCESS CONTROL: Vendors & Vendor Teams
  const [vendorAccessUsers, setVendorAccessUsers] = useState<ManagedVendorAccessUser[]>(INITIAL_VENDOR_ACCESS_USERS);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false);

  // Add Vendor Form
  const [newVendorForm, setNewVendorForm] = useState({
    companyName: '',
    vendorCode: `VND-CORP-0${vendorAccessUsers.length + 1}`,
    primaryAdminName: '',
    email: '',
    phone: '',
    password: 'password123',
    assignedFleetQuota: 15,
  });

  // Add Vendor Team Member Form
  const [newTeamMemberForm, setNewTeamMemberForm] = useState({
    vendorCompany: 'Nexus Global Enterprise Tech',
    name: '',
    email: '',
    phone: '',
    aliasCode: `VND-TEAM-0${vendorAccessUsers.length + 1}`,
    roleTitle: 'Shift Commute Operations Coordinator (Vendor Team)',
    canAllocateCabs: true,
    canViewRadar: true,
    canRequestAdhoc: true,
    canViewBilling: false,
    canManageRoster: true,
  });

  // Hydrate persistent state from storage on mount
  useEffect(() => {
    const savedContracts = getStoredItem<ContractRecord[]>(STORAGE_KEYS.CONTRACTS, null as any);
    if (savedContracts && Array.isArray(savedContracts) && savedContracts.length > 0) {
      setContractsList(savedContracts);
    }
    const savedVehicles = getStoredItem<VehicleRecord[]>(STORAGE_KEYS.VEHICLES, null as any);
    if (savedVehicles && Array.isArray(savedVehicles) && savedVehicles.length > 0) {
      setVehiclesList(savedVehicles);
    }
    const savedDrivers = getStoredItem<DriverRecord[]>(STORAGE_KEYS.DRIVERS, null as any);
    if (savedDrivers && Array.isArray(savedDrivers) && savedDrivers.length > 0) {
      setDriversList(savedDrivers);
    }
    const savedRules = getStoredItem<ComplianceRule[]>(STORAGE_KEYS.COMPLIANCE, null as any);
    if (savedRules && Array.isArray(savedRules) && savedRules.length > 0) {
      setComplianceRules(savedRules);
    }
    const savedDevices = getStoredItem<FixedDeviceRecord[]>(STORAGE_KEYS.DEVICES, null as any);
    if (savedDevices && Array.isArray(savedDevices) && savedDevices.length > 0) {
      setFixedDevices(savedDevices);
    }
    const savedVendors = getStoredItem<ManagedVendorAccessUser[]>(STORAGE_KEYS.VENDOR_USERS, null as any);
    if (savedVendors && Array.isArray(savedVendors) && savedVendors.length > 0) {
      setVendorAccessUsers(savedVendors);
    }
  }, []);

  // CSV Export utility
  const handleExportCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename} successfully!`);
  };

  // Toggle compliance rule (Persisted Permanently)
  const handleToggleRule = (ruleId: string) => {
    setComplianceRules((prev) => {
      const updated = prev.map((r) => {
        if (r.id === ruleId) {
          const nextVal = !r.enabled;
          showToast(`Compliance rule "${r.name}" has been ${nextVal ? 'ENABLED' : 'DISABLED'}`);
          return { ...r, enabled: nextVal };
        }
        return r;
      });
      setStoredItem(STORAGE_KEYS.COMPLIANCE, updated);
      return updated;
    });
  };

  // Toggle Vendor User Access (Admin only authority - Persisted & Synced)
  const handleToggleUserAccess = (userId: string) => {
    setVendorAccessUsers((prev) => {
      let toggledVal = false;
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const nextVal = !u.isAccessGranted;
          toggledVal = nextVal;
          showToast(`Super Admin updated ${u.name}'s account: ${nextVal ? 'ACCESS GRANTED ✓' : 'ACCESS SUSPENDED ✕'}`);
          return { ...u, isAccessGranted: nextVal };
        }
        return u;
      });
      setStoredItem(STORAGE_KEYS.VENDOR_USERS, updated);
      fetch('/api/portal/sync-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-access', id: userId, isAccessGranted: toggledVal }),
      }).catch(() => {});
      return updated;
    });
  };

  // Toggle specific permission for a vendor team member (Persisted Permanently)
  const handleTogglePermission = (
    userId: string,
    permissionKey: 'canAllocateCabs' | 'canViewRadar' | 'canRequestAdhoc' | 'canViewBilling' | 'canManageRoster'
  ) => {
    setVendorAccessUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const mod = {
            ...u,
            permissions: {
              ...u.permissions,
              [permissionKey]: !u.permissions[permissionKey],
            },
          };
          showToast(`Admin updated permission "${permissionKey}" for ${u.name}`);
          return mod;
        }
        return u;
      });
      setStoredItem(STORAGE_KEYS.VENDOR_USERS, updated);
      return updated;
    });
  };

  // Create New Vendor Submit (Admin Authority - Persisted Permanently & Synced to Auth Registry)
  const handleCreateVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorForm.companyName || !newVendorForm.primaryAdminName || !newVendorForm.email) {
      showToast('Please fill all mandatory vendor organization fields.');
      return;
    }

    const created: ManagedVendorAccessUser = {
      id: `vnd-user-${Date.now()}`,
      name: newVendorForm.primaryAdminName,
      email: newVendorForm.email.toLowerCase(),
      phone: newVendorForm.phone || '+91 98000 00000',
      aliasCode: newVendorForm.vendorCode.toUpperCase(),
      vendorCompany: newVendorForm.companyName,
      userType: 'PRIMARY_VENDOR',
      roleTitle: `Head of Workplace Mobility (${newVendorForm.companyName})`,
      authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
      isAccessGranted: true,
      permissions: {
        canAllocateCabs: true,
        canViewRadar: true,
        canRequestAdhoc: true,
        canViewBilling: true,
        canManageRoster: true,
      },
      lastLogin: 'Provisioned Just Now',
    };

    const updated = [created, ...vendorAccessUsers];
    setVendorAccessUsers(updated);
    setStoredItem(STORAGE_KEYS.VENDOR_USERS, updated);

    // Sync with central backend auth registry so newly provisioned accounts can immediately log in
    fetch('/api/portal/sync-vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', account: created }),
    }).catch(() => {});

    setIsAddVendorModalOpen(false);
    showToast(`Vendor ${created.vendorCompany} provisioned & granted access by Super Admin!`);
  };

  // Add Vendor Team Member Submit (Admin Authority - Persisted Permanently & Synced to Auth Registry)
  const handleAddTeamMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMemberForm.name || !newTeamMemberForm.email) {
      showToast('Please enter Team Member Name and Corporate Email.');
      return;
    }

    const created: ManagedVendorAccessUser = {
      id: `vnd-user-${Date.now()}`,
      name: newTeamMemberForm.name,
      email: newTeamMemberForm.email.toLowerCase(),
      phone: newTeamMemberForm.phone || '+91 98000 00000',
      aliasCode: newTeamMemberForm.aliasCode.toUpperCase(),
      vendorCompany: newTeamMemberForm.vendorCompany,
      userType: 'VENDOR_TEAM_MEMBER',
      roleTitle: newTeamMemberForm.roleTitle,
      authorizedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
      isAccessGranted: true,
      permissions: {
        canAllocateCabs: newTeamMemberForm.canAllocateCabs,
        canViewRadar: newTeamMemberForm.canViewRadar,
        canRequestAdhoc: newTeamMemberForm.canRequestAdhoc,
        canViewBilling: newTeamMemberForm.canViewBilling,
        canManageRoster: newTeamMemberForm.canManageRoster,
      },
      lastLogin: 'Provisioned Just Now',
    };

    const updated = [created, ...vendorAccessUsers];
    setVendorAccessUsers(updated);
    setStoredItem(STORAGE_KEYS.VENDOR_USERS, updated);

    // Sync with central backend auth registry
    fetch('/api/portal/sync-vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', account: created }),
    }).catch(() => {});

    setIsAddTeamMemberModalOpen(false);
    showToast(`Super Admin granted access to Vendor Team Member ${created.name}!`);
  };

  // Submit New Contract Form (Persisted Permanently)
  const handleCreateContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractForm.code || !newContractForm.title) {
      showToast('Please fill all mandatory contract fields.');
      return;
    }

    const created: ContractRecord = {
      id: `cnt-${Date.now()}`,
      code: newContractForm.code,
      title: newContractForm.title,
      transporter: newContractForm.transporter,
      clientPartner: newContractForm.clientPartner,
      vehicleCategory: newContractForm.vehicleCategory,
      vehicleQuota: Number(newContractForm.vehicleQuota),
      monthlyBaseKm: Number(newContractForm.monthlyBaseKm),
      monthlyBaseRental: Number(newContractForm.monthlyBaseRental),
      extraKmRate: Number(newContractForm.extraKmRate),
      extraHourRate: Number(newContractForm.extraHourRate),
      nightEscortAllowance: Number(newContractForm.nightEscortAllowance),
      validFrom: newContractForm.validFrom,
      validTo: newContractForm.validTo,
      billingCycle: newContractForm.billingCycle,
      status: 'ACTIVE',
      slaOnTimeThreshold: '98.5%',
    };

    const updated = [created, ...contractsList];
    setContractsList(updated);
    setStoredItem(STORAGE_KEYS.CONTRACTS, updated);
    showToast(`Contract ${created.code} activated successfully for Atharva Travels!`);
    handleTabSelect('VEHICLE_CONTRACTS');
  };

  // Submit New Vehicle Form (Persisted Permanently)
  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleForm.plate || !newVehicleForm.driverName) {
      showToast('Please enter vehicle plate and driver name.');
      return;
    }

    const created: VehicleRecord = {
      id: `v-${Date.now()}`,
      plate: newVehicleForm.plate.toUpperCase(),
      model: newVehicleForm.model,
      category: newVehicleForm.category,
      seatingCapacity: newVehicleForm.seatingCapacity,
      fuelType: newVehicleForm.fuelType,
      driverName: newVehicleForm.driverName,
      driverPhone: newVehicleForm.driverPhone || '+91 98000 00000',
      rcExpiry: newVehicleForm.rcExpiry,
      insurancePolicy: newVehicleForm.insurancePolicy,
      insuranceExpiry: newVehicleForm.insuranceExpiry,
      fitnessExpiry: newVehicleForm.fitnessExpiry,
      pucExpiry: newVehicleForm.pucExpiry,
      speedGovernorCert: newVehicleForm.speedGovernorCert,
      gpsDeviceId: newVehicleForm.gpsDeviceId || `AIS-140-${newVehicleForm.plate.slice(-4)}`,
      status: 'DEPOT_STANDBY',
    };

    const updated = [created, ...vehiclesList];
    setVehiclesList(updated);
    setStoredItem(STORAGE_KEYS.VEHICLES, updated);
    setIsAddVehicleModalOpen(false);
    showToast(`Vehicle ${created.plate} enrolled into Atharva Travels active fleet!`);
  };

  // Submit New Driver Form (Persisted Permanently)
  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverForm.name || !newDriverForm.phone || !newDriverForm.dlNumber) {
      showToast('Please fill in Driver Name, Phone, and DL Number.');
      return;
    }

    const created: DriverRecord = {
      id: `d-${Date.now()}`,
      staffCode: newDriverForm.staffCode,
      name: newDriverForm.name,
      phone: newDriverForm.phone,
      dlNumber: newDriverForm.dlNumber.toUpperCase(),
      dlExpiry: newDriverForm.dlExpiry,
      badgeNumber: newDriverForm.badgeNumber || 'PSV-BLR-NEW',
      policeBvcStatus: 'VERIFIED',
      policeBvcCert: newDriverForm.policeBvcCert || 'BVC-KA-2026-APP',
      medicalFitness: 'PASSED',
      eyeTestDate: '01-Nov-2026',
      trainingStatus: 'CERTIFIED',
      assignedCabPlate: newDriverForm.assignedCabPlate || 'Standby Depot',
      totalTrips: 0,
      rating: 5.0,
      status: 'ACTIVE',
    };

    const updated = [created, ...driversList];
    setDriversList(updated);
    setStoredItem(STORAGE_KEYS.DRIVERS, updated);
    setIsAddDriverModalOpen(false);
    showToast(`Driver ${created.name} (${created.staffCode}) successfully onboarded!`);
  };

  // Ping Fixed Device
  const handlePingDevice = (device: FixedDeviceRecord) => {
    setPingingDeviceId(device.id);
    showToast(`Pinging AIS-140 unit on ${device.mappedPlate} (IMEI: ${device.imei})...`);
    setTimeout(() => {
      setPingingDeviceId(null);
      showToast(`✓ Ping response from ${device.mappedPlate}: 14ms latency | GPS 3D Fix 12 Sats | 13.8V OK`);
    }, 900);
  };

  // Trigger Remote SOS Test
  const handleTestSos = (device: FixedDeviceRecord) => {
    showToast(`Simulating dual panic SOS button heartbeat signal for ${device.mappedPlate}...`);
    setTimeout(() => {
      showToast(`✓ In-cab Panic SOS switches verified on ${device.mappedPlate}. Transport Control Room received test beacon!`);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f4f7fb] text-slate-800 font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. SETTINGS SUB-HEADER WITH RECTANGULAR TABS                              */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 pt-4 pb-0 shadow-sm sticky top-0 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#0f5fc2]">
                ATHARVA FLEET OPERATIONS & ACCESS CONTROL
              </span>
              <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black px-2 py-0.5">
                SUPER ADMIN MASTER AUTHORITY
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
              Enterprise Fleet & Vendor Access Administration
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="border border-slate-200 bg-slate-50 px-3 py-1.5 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Root Authority: <strong className="text-slate-900">Atharva Super Admin (ATH-ADMIN-01)</strong></span>
            </div>
            <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1.5 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>RBAC Security: 100% Active</span>
            </div>
          </div>
        </div>

        {/* 7 SUB-TABS (Strict Rectangular, Zero Curvature) */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-bold border-t border-slate-100 pt-1">
          
          {/* TAB 1: VEHICLE CONTRACTS */}
          <button
            onClick={() => handleTabSelect('VEHICLE_CONTRACTS')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'VEHICLE_CONTRACTS'
                ? 'bg-[#e8f1fc] text-[#0f5fc2] font-black border-b-2 border-[#0f5fc2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>VEHICLE CONTRACTS</span>
            <span className="bg-blue-100 text-[#0f5fc2] text-[10px] px-1.5 py-0.2">
              {contractsList.length}
            </span>
          </button>

          {/* TAB 2: MANAGE NEW CONTRACTS */}
          <button
            onClick={() => handleTabSelect('MANAGE_NEW_CONTRACTS')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'MANAGE_NEW_CONTRACTS'
                ? 'bg-[#e8f1fc] text-[#0f5fc2] font-black border-b-2 border-[#0f5fc2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>MANAGE NEW CONTRACTS</span>
          </button>

          {/* TAB 3: MANAGE VEHICLES */}
          <button
            onClick={() => handleTabSelect('MANAGE_VEHICLES')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'MANAGE_VEHICLES'
                ? 'bg-[#e8f1fc] text-[#0f5fc2] font-black border-b-2 border-[#0f5fc2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>MANAGE VEHICLES</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2">
              {vehiclesList.length}
            </span>
          </button>

          {/* TAB 4: MANAGE DRIVERS */}
          <button
            onClick={() => handleTabSelect('MANAGE_DRIVERS')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'MANAGE_DRIVERS'
                ? 'bg-[#e8f1fc] text-[#0f5fc2] font-black border-b-2 border-[#0f5fc2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>MANAGE DRIVERS</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2">
              {driversList.length}
            </span>
          </button>

          {/* TAB 5: MANAGE COMPLIANCE */}
          <button
            onClick={() => handleTabSelect('MANAGE_COMPLIANCE')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'MANAGE_COMPLIANCE'
                ? 'bg-[#e8f1fc] text-[#0f5fc2] font-black border-b-2 border-[#0f5fc2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MANAGE COMPLIANCE</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2">
              100% BVC
            </span>
          </button>

          {/* TAB 6: MANAGE FIXED DEVICES */}
          <button
            onClick={() => handleTabSelect('MANAGE_FIXED_DEVICES')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'MANAGE_FIXED_DEVICES'
                ? 'bg-[#e8f1fc] text-[#0f5fc2] font-black border-b-2 border-[#0f5fc2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>MANAGE FIXED DEVICES</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2">
              168 Units
            </span>
          </button>

          {/* TAB 7: ACCESS & VENDOR TEAMS (Super Admin Exclusive Authority) */}
          <button
            onClick={() => handleTabSelect('MANAGE_VENDOR_ACCESS')}
            className={`px-4 py-2.5 transition-all flex items-center space-x-2 shrink-0 ${
              currentTab === 'MANAGE_VENDOR_ACCESS'
                ? 'bg-amber-100 text-amber-900 font-black border-b-2 border-amber-600'
                : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>ACCESS & VENDOR TEAMS</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2">
              Admin Main
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BODY CONTENT ROUTED ACCORDING TO ACTIVE SUB-TAB                        */}
      {/* ========================================================================= */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
        
        {/* ========================================================================= */}
        {/* SUB-TAB 7: ACCESS & VENDOR TEAMS (Super Admin Authority)                  */}
        {/* ========================================================================= */}
        {currentTab === 'MANAGE_VENDOR_ACCESS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* SUPER ADMIN NOTICE BANNER */}
            <div className="bg-amber-50 border-2 border-amber-400 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-600 text-white p-2">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-950 uppercase tracking-tight">
                    Atharva Super Admin Access Control Console
                  </h3>
                  <p className="text-xs text-amber-900 mt-0.5">
                    <strong>Admin is the primary authority.</strong> Only Atharva Super Admin can create corporate vendor accounts, grant portal access, and provision vendor team members with granular permissions.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setIsAddVendorModalOpen(true)}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-black px-3.5 py-2 shadow-sm flex items-center space-x-1.5 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Create Vendor Organization</span>
                </button>

                <button
                  onClick={() => setIsAddTeamMemberModalOpen(true)}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3.5 py-2 shadow-sm flex items-center space-x-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Vendor Team Member</span>
                </button>
              </div>
            </div>

            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Authorized Vendors
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  2 Organizations
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Nexus Global & Apex Cloud
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Provisioned Vendor Team Members
                </span>
                <div className="text-2xl font-black text-[#0f5fc2] mt-1">
                  {vendorAccessUsers.filter((u) => u.userType === 'VENDOR_TEAM_MEMBER').length} Team Accounts
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Active in Operations & Dispatch
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Access Status
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {vendorAccessUsers.filter((u) => u.isAccessGranted).length} / {vendorAccessUsers.length} Active
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  ✓ 100% Admin Authorized
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Admin Authority ID
                </span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  ATH-ADMIN-01
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Atharva Central Super Admin
                </span>
              </div>
            </div>

            {/* ACTION & SEARCH ROW */}
            <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="relative w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search vendor name, staff ID, email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => {
                    const csvRows = [
                      ['Name', 'Email', 'Alias Code', 'Vendor Organization', 'Type', 'Role Title', 'Authorized By', 'Access Status', 'Permissions'],
                      ...vendorAccessUsers.map((u) => [
                        u.name,
                        u.email,
                        u.aliasCode,
                        u.vendorCompany,
                        u.userType,
                        u.roleTitle,
                        u.authorizedByAdmin,
                        u.isAccessGranted ? 'ACTIVE' : 'SUSPENDED',
                        `Allocate:${u.permissions.canAllocateCabs ? 'Y' : 'N'} | Radar:${u.permissions.canViewRadar ? 'Y' : 'N'} | Billing:${u.permissions.canViewBilling ? 'Y' : 'N'}`,
                      ]),
                    ];
                    const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
                    handleExportCSV('Atharva_Vendor_Team_Access_Matrix.csv', csvContent);
                  }}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export RBAC Matrix CSV</span>
                </button>
              </div>
            </div>

            {/* VENDOR & TEAM ACCESS CONTROL TABLE */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-4">Authorized User & Alias</th>
                    <th className="py-2.5 px-4">Vendor Organization</th>
                    <th className="py-2.5 px-4">Role / Designation</th>
                    <th className="py-2.5 px-4">Authority & Provisioned By</th>
                    <th className="py-2.5 px-4">Admin-Granted Permissions</th>
                    <th className="py-2.5 px-4">Access Status</th>
                    <th className="py-2.5 px-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {vendorAccessUsers
                    .filter((u) => {
                      return (
                        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.aliasCode.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.vendorCompany.toLowerCase().includes(userSearchQuery.toLowerCase())
                      );
                    })
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{user.name}</span>
                          <span className="font-mono text-blue-800 text-[11px] block">{user.aliasCode} • {user.email}</span>
                          <span className="text-[10px] text-slate-400 block">{user.phone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{user.vendorCompany}</span>
                          <span className="text-[10px] text-slate-500 block uppercase">
                            {user.userType === 'PRIMARY_VENDOR' ? 'Primary Vendor Lead' : 'Vendor Team Staff'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block text-[11px]">{user.roleTitle}</span>
                          <span className="text-slate-400 text-[10px] block">Last Seen: {user.lastLogin}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 font-bold text-[10px] inline-flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-amber-700" />
                            <span>{user.authorizedByAdmin}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            <button
                              onClick={() => handleTogglePermission(user.id, 'canAllocateCabs')}
                              className={`px-1.5 py-0.5 font-semibold transition-colors ${
                                user.permissions.canAllocateCabs
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                              }`}
                              title="Toggle Cab Allocation Permission"
                            >
                              Allocate Cabs
                            </button>
                            <button
                              onClick={() => handleTogglePermission(user.id, 'canViewRadar')}
                              className={`px-1.5 py-0.5 font-semibold transition-colors ${
                                user.permissions.canViewRadar
                                  ? 'bg-blue-100 text-[#0f5fc2] border border-blue-300'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                              }`}
                              title="Toggle Live Radar Permission"
                            >
                              Live Radar
                            </button>
                            <button
                              onClick={() => handleTogglePermission(user.id, 'canViewBilling')}
                              className={`px-1.5 py-0.5 font-semibold transition-colors ${
                                user.permissions.canViewBilling
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                              }`}
                              title="Toggle Billing Access Permission"
                            >
                              Billing Slabs
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.isAccessGranted ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold text-[10px] inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ACCESS ACTIVE</span>
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 font-bold text-[10px] inline-flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              <span>SUSPENDED</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserAccess(user.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                              user.isAccessGranted
                                ? 'bg-red-50 hover:bg-red-600 hover:text-white border-red-300 text-red-700'
                                : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-300 text-emerald-700'
                            }`}
                          >
                            {user.isAccessGranted ? 'Revoke Access' : 'Grant Access'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 1: VEHICLE CONTRACTS                                              */}
        {/* ========================================================================= */}
        {currentTab === 'VEHICLE_CONTRACTS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Vendor Contracts
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {contractsList.filter((c) => c.status === 'ACTIVE').length} Active
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  ✓ Atharva Master Transporter Agreements
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Contracted Fleet Quota
                </span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {contractsList.reduce((acc, c) => acc + c.vehicleQuota, 0)} Cabs
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Innova (24) • Dzire (14) • Shuttle (4) • EV (6)
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Avg Monthly Km Commitment
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  2,425 km / Cab
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Standard Slabs: 2000, 2200, 2500, 3000
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Night Escort Surcharge
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹450 / Shift
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  Mandatory female drop security clause
                </span>
              </div>
            </div>

            {/* ACTION & FILTER BAR */}
            <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search contract code, title..."
                    value={contractSearchQuery}
                    onChange={(e) => setContractSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Vehicle Type:</span>
                  <select
                    value={contractCategoryFilter}
                    onChange={(e) => setContractCategoryFilter(e.target.value)}
                    className="border border-slate-300 px-2 py-1.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="SUV">SUV (Innova Crysta)</option>
                    <option value="Sedan">Sedan (Dzire)</option>
                    <option value="Tempo">Tempo Traveller</option>
                    <option value="EV">Electric Vehicle</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => handleTabSelect('MANAGE_NEW_CONTRACTS')}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Contract</span>
                </button>

                <button
                  onClick={() => {
                    const csvRows = [
                      ['Contract ID', 'Title', 'Transporter', 'Client Partner', 'Category', 'Quota', 'Base Rental', 'Extra Km Rate', 'Valid To', 'Status'],
                      ...contractsList.map((c) => [c.code, c.title, c.transporter, c.clientPartner, c.vehicleCategory, c.vehicleQuota, c.monthlyBaseRental, c.extraKmRate, c.validTo, c.status]),
                    ];
                    const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
                    handleExportCSV('Atharva_Enterprise_Vehicle_Contracts.csv', csvContent);
                  }}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* CONTRACTS DATA TABLE */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-4">Contract Code</th>
                    <th className="py-2.5 px-4">Agreement Title & Client Partner</th>
                    <th className="py-2.5 px-4">Category & Fleet Quota</th>
                    <th className="py-2.5 px-4">Monthly Slabs (Base / Over)</th>
                    <th className="py-2.5 px-4">Night Escort Clause</th>
                    <th className="py-2.5 px-4">Validity</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {contractsList
                    .filter((c) => {
                      const matchQuery =
                        c.code.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
                        c.title.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
                        c.vehicleCategory.toLowerCase().includes(contractSearchQuery.toLowerCase());
                      const matchCategory =
                        contractCategoryFilter === 'ALL' || c.vehicleCategory.includes(contractCategoryFilter);
                      return matchQuery && matchCategory;
                    })
                    .map((contract) => (
                      <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-800">
                          {contract.code}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{contract.title}</span>
                          <span className="text-[11px] text-slate-500 block">Client: {contract.clientPartner}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold block">{contract.vehicleCategory}</span>
                          <span className="text-emerald-700 font-bold text-[11px] block">
                            {contract.vehicleQuota} Dedicated Cabs
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">
                            ₹{contract.monthlyBaseRental.toLocaleString('en-IN')} / mo ({contract.monthlyBaseKm} km)
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            Extra: ₹{contract.extraKmRate}/km • ₹{contract.extraHourRate}/hr
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {contract.nightEscortAllowance > 0 ? (
                            <span className="bg-blue-50 text-[#0f5fc2] border border-blue-200 px-2 py-0.5 font-bold text-[10px] inline-flex items-center space-x-1">
                              <Shield className="w-3 h-3" />
                              <span>₹{contract.nightEscortAllowance} / Night Guard</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">N/A (Day / Shuttle)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 block text-[11px]">
                            {contract.validFrom} – {contract.validTo}
                          </span>
                          <span className="text-slate-400 text-[10px] block">Cycle: {contract.billingCycle}</span>
                        </td>
                        <td className="py-3 px-4">
                          {contract.status === 'ACTIVE' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                              ACTIVE
                            </span>
                          )}
                          {contract.status === 'EXPIRING_SOON' && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 font-bold text-[10px]">
                              EXPIRING SOON
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedContractForModal(contract)}
                            className="bg-slate-100 hover:bg-[#0f5fc2] hover:text-white border border-slate-300 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition-colors"
                          >
                            View Slabs
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: MANAGE NEW CONTRACTS (Contract Creation Form)                  */}
        {/* ========================================================================= */}
        {currentTab === 'MANAGE_NEW_CONTRACTS' && (
          <div className="bg-white border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f5fc2] block">
                  PROCUREMENT AUTHORING WIZARD
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  Create New Transporter Vehicle Contract
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure corporate mileage slabs, vehicle categories, escort security allowances, and billing terms.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2 text-right text-xs">
                <span className="text-slate-500 block">Target Transporter Entity:</span>
                <strong className="text-slate-900">Atharva Travels Pvt Ltd</strong>
              </div>
            </div>

            <form onSubmit={handleCreateContractSubmit} className="space-y-6">
              
              {/* SECTION A: CONTRACT ESSENTIALS */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wide flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Section A: Master Agreement Identity</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contract Code *</label>
                    <input
                      type="text"
                      required
                      value={newContractForm.code}
                      onChange={(e) => setNewContractForm({ ...newContractForm, code: e.target.value })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Client Partner / Vendor *</label>
                    <input
                      type="text"
                      required
                      value={newContractForm.clientPartner}
                      onChange={(e) => setNewContractForm({ ...newContractForm, clientPartner: e.target.value })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contract Title *</label>
                    <input
                      type="text"
                      required
                      value={newContractForm.title}
                      onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                      placeholder="e.g. Atharva Outer Ring Road Night Shuttle Slabs"
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Category *</label>
                    <select
                      value={newContractForm.vehicleCategory}
                      onChange={(e) => setNewContractForm({ ...newContractForm, vehicleCategory: e.target.value })}
                      className="w-full border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:border-[#0f5fc2]"
                    >
                      <option value="SUV 7-Seater (Toyota Innova Crysta)">SUV 7-Seater (Toyota Innova Crysta)</option>
                      <option value="Sedan 4-Seater (Maruti Dzire)">Sedan 4-Seater (Maruti Dzire Tour)</option>
                      <option value="Tempo Traveller (12+1 Force Traveller)">Tempo Traveller (12+1 Force Traveller)</option>
                      <option value="Electric Vehicle (Tata Tigor EV)">Electric Vehicle (Tata Tigor EV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Committed Vehicle Quota *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newContractForm.vehicleQuota}
                      onChange={(e) => setNewContractForm({ ...newContractForm, vehicleQuota: Number(e.target.value) })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Billing Cycle *</label>
                    <select
                      value={newContractForm.billingCycle}
                      onChange={(e) => setNewContractForm({ ...newContractForm, billingCycle: e.target.value })}
                      className="w-full border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:border-[#0f5fc2]"
                    >
                      <option value="Monthly (Net-30)">Monthly (Net-30 Days)</option>
                      <option value="Bi-Weekly (Net-15)">Bi-Weekly (Net-15 Days)</option>
                      <option value="Weekly Transit Settlement">Weekly Transit Settlement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: BILLING & KILOMETRIC SLABS */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wide flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>Section B: Kilometric & Hourly Billing Slabs</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Monthly Base Slabs (Km) *</label>
                    <input
                      type="number"
                      required
                      value={newContractForm.monthlyBaseKm}
                      onChange={(e) => setNewContractForm({ ...newContractForm, monthlyBaseKm: Number(e.target.value) })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                    <span className="text-[10px] text-slate-500">e.g. 2500 km per cab / month</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Base Monthly Rental (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newContractForm.monthlyBaseRental}
                      onChange={(e) => setNewContractForm({ ...newContractForm, monthlyBaseRental: Number(e.target.value) })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                    <span className="text-[10px] text-slate-500">Fixed monthly package</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Extra Kilometer Rate (₹/km) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newContractForm.extraKmRate}
                      onChange={(e) => setNewContractForm({ ...newContractForm, extraKmRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                    <span className="text-[10px] text-slate-500">Applied beyond base km</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Extra Hour Waiting (₹/hr) *</label>
                    <input
                      type="number"
                      step="5"
                      required
                      value={newContractForm.extraHourRate}
                      onChange={(e) => setNewContractForm({ ...newContractForm, extraHourRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                    <span className="text-[10px] text-slate-500">Beyond standard trip window</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Night Escort Allowance (₹ / shift) *</label>
                    <input
                      type="number"
                      required
                      value={newContractForm.nightEscortAllowance}
                      onChange={(e) => setNewContractForm({ ...newContractForm, nightEscortAllowance: Number(e.target.value) })}
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-[#0f5fc2]"
                    />
                    <span className="text-[10px] text-slate-500">Payable on female escort night drops</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contract Start Date *</label>
                    <input
                      type="date"
                      required
                      value={newContractForm.validFrom}
                      onChange={(e) => setNewContractForm({ ...newContractForm, validFrom: e.target.value })}
                      className="w-full border border-slate-300 p-2 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contract Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={newContractForm.validTo}
                      onChange={(e) => setNewContractForm({ ...newContractForm, validTo: e.target.value })}
                      className="w-full border border-slate-300 p-2 text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleTabSelect('VEHICLE_CONTRACTS')}
                  className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Activate & Save Contract</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: MANAGE VEHICLES (Fleet Master Registry)                        */}
        {/* ========================================================================= */}
        {currentTab === 'MANAGE_VEHICLES' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* FLEET KPI STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Atharva Fleet
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {vehiclesList.length} Registered Cabs
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  100% AIS-140 GPS Connected
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active On Commute
                </span>
                <div className="text-2xl font-black text-[#0f5fc2] mt-1">
                  {vehiclesList.filter((v) => v.status === 'ACTIVE_ROUTE').length} Cabs En-Route
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Live on Bangalore Traffic Grid
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Depot Standby (Ready)
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {vehiclesList.filter((v) => v.status === 'DEPOT_STANDBY').length} Cabs Available
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Main Campus Terminal Depot
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Document Renewal Alert
                </span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {vehiclesList.filter((v) => v.status === 'DOCS_DUE').length} Action Due
                </div>
                <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                  Insurance / Fitness 30-day window
                </span>
              </div>
            </div>

            {/* ACTION & FILTER ROW */}
            <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search vehicle plate, driver..."
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Category:</span>
                  <select
                    value={vehicleCategoryFilter}
                    onChange={(e) => setVehicleCategoryFilter(e.target.value)}
                    className="border border-slate-300 px-2 py-1.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="SUV">SUV (Innova)</option>
                    <option value="Sedan">Sedan (Dzire)</option>
                    <option value="Tempo">Tempo Traveller</option>
                    <option value="EV">Electric Vehicle</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setIsAddVehicleModalOpen(true)}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add New Vehicle</span>
                </button>

                <button
                  onClick={() => {
                    const csvRows = [
                      ['Plate', 'Model', 'Category', 'Capacity', 'Fuel', 'Driver', 'Phone', 'RC Expiry', 'Insurance Expiry', 'Fitness Expiry', 'Status'],
                      ...vehiclesList.map((v) => [v.plate, v.model, v.category, v.seatingCapacity, v.fuelType, v.driverName, v.driverPhone, v.rcExpiry, v.insuranceExpiry, v.fitnessExpiry, v.status]),
                    ];
                    const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
                    handleExportCSV('Atharva_Fleet_Master_Registry.csv', csvContent);
                  }}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Fleet CSV</span>
                </button>
              </div>
            </div>

            {/* VEHICLES MASTER TABLE */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-4">Vehicle Plate</th>
                    <th className="py-2.5 px-4">Model & Capacity</th>
                    <th className="py-2.5 px-4">Assigned Driver & Phone</th>
                    <th className="py-2.5 px-4">RC & Fitness Validity</th>
                    <th className="py-2.5 px-4">Insurance Policy</th>
                    <th className="py-2.5 px-4">PUC & Speed Governor</th>
                    <th className="py-2.5 px-4">GPS Beacon</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {vehiclesList
                    .filter((v) => {
                      const matchQuery =
                        v.plate.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                        v.driverName.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                        v.model.toLowerCase().includes(vehicleSearchQuery.toLowerCase());
                      const matchCategory =
                        vehicleCategoryFilter === 'ALL' || v.category === vehicleCategoryFilter;
                      const matchStatus =
                        vehicleStatusFilter === 'ALL' || v.status === vehicleStatusFilter;
                      return matchQuery && matchCategory && matchStatus;
                    })
                    .map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                          {vehicle.plate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{vehicle.model}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Capacity: {vehicle.seatingCapacity} • {vehicle.fuelType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{vehicle.driverName}</span>
                          <span className="text-[11px] text-slate-500 block">{vehicle.driverPhone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold block text-[11px]">
                            RC: {vehicle.rcExpiry}
                          </span>
                          <span className="text-slate-500 text-[10px] block">
                            Fitness: {vehicle.fitnessExpiry}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold block text-[11px]">
                            {vehicle.insurancePolicy}
                          </span>
                          <span className="text-slate-500 text-[10px] block">
                            Exp: {vehicle.insuranceExpiry}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold block text-[11px]">
                            PUC: {vehicle.pucExpiry}
                          </span>
                          <span className="text-emerald-700 font-bold text-[10px] block">
                            ✓ {vehicle.speedGovernorCert}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                          {vehicle.gpsDeviceId}
                        </td>
                        <td className="py-3 px-4">
                          {vehicle.status === 'ACTIVE_ROUTE' && (
                            <span className="bg-blue-100 text-[#0f5fc2] border border-blue-300 px-2 py-0.5 font-bold text-[10px]">
                              ACTIVE ROUTE
                            </span>
                          )}
                          {vehicle.status === 'DEPOT_STANDBY' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                              DEPOT STANDBY
                            </span>
                          )}
                          {vehicle.status === 'DOCS_DUE' && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 font-bold text-[10px]">
                              DOCS DUE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              showToast(`Displaying digital RTO documents & fitness cert for ${vehicle.plate}`)
                            }
                            className="bg-slate-100 hover:bg-[#0f5fc2] hover:text-white border border-slate-300 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition-colors"
                          >
                            Inspect Docs
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 4: MANAGE DRIVERS (Chauffeur Master & Police Verification)         */}
        {/* ========================================================================= */}
        {currentTab === 'MANAGE_DRIVERS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* DRIVERS STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Registered Chauffeurs
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {driversList.length} Roster Drivers
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  Atharva Travels Chauffeur Desk
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Police BVC Clearance Rate
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {Math.round((driversList.filter((d) => d.policeBvcStatus === 'VERIFIED').length / driversList.length) * 100)}%
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Karnataka State Police Certified
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  POSH & Defensive Certified
                </span>
                <div className="text-2xl font-black text-[#0f5fc2] mt-1">
                  100%
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Gender Sensitization & Safety Completed
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Average Chauffeur Rating
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  4.88 ★
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Based on 11,200+ Employee Commute Ratings
                </span>
              </div>
            </div>

            {/* ACTION & FILTER ROW */}
            <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search driver name, staff code, phone..."
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setIsAddDriverModalOpen(true)}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Onboard New Driver</span>
                </button>

                <button
                  onClick={() => {
                    const csvRows = [
                      ['Staff Code', 'Name', 'Phone', 'DL Number', 'DL Expiry', 'Badge No', 'Police BVC', 'BVC Cert', 'Medical', 'Assigned Cab', 'Trips', 'Rating', 'Status'],
                      ...driversList.map((d) => [d.staffCode, d.name, d.phone, d.dlNumber, d.dlExpiry, d.badgeNumber, d.policeBvcStatus, d.policeBvcCert, d.medicalFitness, d.assignedCabPlate, d.totalTrips, d.rating, d.status]),
                    ];
                    const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
                    handleExportCSV('Atharva_Chauffeur_Compliance_Roster.csv', csvContent);
                  }}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Drivers CSV</span>
                </button>
              </div>
            </div>

            {/* DRIVERS TABLE */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-4">Driver Name & Staff Code</th>
                    <th className="py-2.5 px-4">Contact Phone</th>
                    <th className="py-2.5 px-4">Driving License (DL) & Badge</th>
                    <th className="py-2.5 px-4">Police BVC Verification</th>
                    <th className="py-2.5 px-4">Medical & Training</th>
                    <th className="py-2.5 px-4">Assigned Vehicle</th>
                    <th className="py-2.5 px-4">Rating & Trips</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {driversList
                    .filter((d) => {
                      const matchQuery =
                        d.name.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
                        d.staffCode.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
                        d.phone.includes(driverSearchQuery);
                      const matchStatus =
                        driverStatusFilter === 'ALL' || d.status === driverStatusFilter;
                      const matchBvc =
                        driverBvcFilter === 'ALL' || d.policeBvcStatus === driverBvcFilter;
                      return matchQuery && matchStatus && matchBvc;
                    })
                    .map((driver) => (
                      <tr key={driver.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{driver.name}</span>
                          <span className="font-mono text-blue-800 text-[11px] block">{driver.staffCode}</span>
                        </td>
                        <td className="py-3 px-4">
                          <a href={`tel:${driver.phone}`} className="text-slate-800 font-semibold hover:text-blue-700">
                            {driver.phone}
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block text-[11px]">
                            {driver.dlNumber}
                          </span>
                          <span className="text-slate-500 text-[10px] block">
                            Badge: {driver.badgeNumber} • Exp: {driver.dlExpiry}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {driver.policeBvcStatus === 'VERIFIED' ? (
                            <div>
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold text-[10px] inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>VERIFIED ✓</span>
                              </span>
                              <span className="text-slate-500 text-[10px] block mt-0.5">
                                Cert: {driver.policeBvcCert}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 font-bold text-[10px]">
                                RENEWAL DUE
                              </span>
                              <span className="text-amber-700 text-[10px] block mt-0.5">Expiring this month</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 font-semibold block text-[11px]">
                            Medical: {driver.medicalFitness} (Eye: {driver.eyeTestDate})
                          </span>
                          <span className="text-emerald-700 font-bold text-[10px] block">
                            ✓ {driver.trainingStatus} (POSH)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 text-[11px]">
                          {driver.assignedCabPlate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block text-xs">
                            {driver.rating} ★
                          </span>
                          <span className="text-slate-500 text-[10px] block">
                            {driver.totalTrips.toLocaleString()} Trips
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {driver.status === 'ACTIVE' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                              ACTIVE
                            </span>
                          )}
                          {driver.status === 'ON_LEAVE' && (
                            <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 font-bold text-[10px]">
                              ON LEAVE
                            </span>
                          )}
                          {driver.status === 'COMPLIANCE_REVIEW' && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 font-bold text-[10px]">
                              REVIEW
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              showToast(`Displaying Police BVC Dossier & Driving Record for ${driver.name}`)
                            }
                            className="bg-slate-100 hover:bg-[#0f5fc2] hover:text-white border border-slate-300 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition-colors"
                          >
                            Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 5: MANAGE COMPLIANCE (Statutory Policies & Audit Cockpit)         */}
        {/* ========================================================================= */}
        {currentTab === 'MANAGE_COMPLIANCE' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* STATUTORY COCKPIT KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Overall Fleet Compliance
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  99.2%
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  ✓ Audit Certified for Corporate Commute
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Night Escort Guard Coverage
                </span>
                <div className="text-2xl font-black text-[#0f5fc2] mt-1">
                  100%
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  20:00 - 06:00 Female Commuter Drops
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Speed Governor Calibration
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  60 km/h Fixed
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  42/42 Cabs Electronically Locked
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Daily Panic SOS Verification
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  98.8%
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  166 / 168 IoT switches pinged today
                </span>
              </div>
            </div>

            {/* ACTION ROW */}
            <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Statutory Rules & Enforcement Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Government of Karnataka Transport Department & Corporate ETS Security Protocols.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() =>
                    showToast('Broadcasting fleet-wide SOS diagnostic health check across 42 cabs...')
                  }
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Run SOS Diagnostics</span>
                </button>

                <button
                  onClick={() => {
                    const csvRows = [
                      ['Policy Name', 'Category', 'Mandated By', 'Penalty on Violation', 'Compliance Rate', 'Status'],
                      ...complianceRules.map((r) => [r.name, r.category, r.mandatedBy, r.penaltyOnViolation, r.complianceRate, r.enabled ? 'ACTIVE' : 'DISABLED']),
                    ];
                    const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
                    handleExportCSV('Atharva_ETS_Statutory_Compliance_Audit.csv', csvContent);
                  }}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Compliance Certificate</span>
                </button>
              </div>
            </div>

            {/* COMPLIANCE RULES CHECKLIST */}
            <div className="space-y-3">
              {complianceRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className={`border p-4 transition-colors flex flex-wrap items-center justify-between gap-4 ${
                    rule.enabled
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-6 h-6 bg-[#0f5fc2] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900">{rule.name}</h4>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 border border-slate-200 uppercase">
                          {rule.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {rule.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                        <span>Mandate: <strong className="text-slate-700">{rule.mandatedBy}</strong></span>
                        <span>•</span>
                        <span className="text-red-700 font-semibold">Violation: {rule.penaltyOnViolation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Adherence</span>
                      <span className="font-black text-emerald-700 text-sm">{rule.complianceRate}</span>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {rule.enabled ? 'ENFORCED ✓' : 'DISABLED'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 6: MANAGE FIXED DEVICES (IoT Telemetry & MDT Tablets)             */}
        {/* ========================================================================= */}
        {currentTab === 'MANAGE_FIXED_DEVICES' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* FIXED DEVICES STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Fixed Hardware
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  168 Units
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  Across 42 Atharva Cabs
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  AIS-140 GPS Telemetry
                </span>
                <div className="text-2xl font-black text-[#0f5fc2] mt-1">
                  42 Units Online
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Dual IRNSS + GPS Satellite Fix
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  In-Cab Panic SOS Switches
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  84 Buttons
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  2 Per Cab (Front + Rear Seat)
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Driver MDT Tablets
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  42 Android Units
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Samsung Active Tab Knox Managed
                </span>
              </div>
            </div>

            {/* ACTION & SEARCH ROW */}
            <div className="bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="relative w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search device IMEI, vehicle plate..."
                    value={deviceSearchQuery}
                    onChange={(e) => setDeviceSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() =>
                    showToast('Broadcasting OTA sync pulse to all 168 fixed telemetry devices...')
                  }
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold px-3 py-1.5 flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sync Telemetry Polling</span>
                </button>

                <button
                  onClick={() => {
                    const csvRows = [
                      ['IMEI', 'Type', 'Mapped Plate', 'Transporter', 'SIM Carrier', 'Signal', 'Voltage', 'Last Heartbeat', 'Firmware', 'Health'],
                      ...fixedDevices.map((d) => [d.imei, d.deviceType, d.mappedPlate, d.transporter, d.simCarrier, d.signalStrength, d.supplyVoltage, d.lastHeartbeat, d.firmware, d.diagnosticHealth]),
                    ];
                    const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
                    handleExportCSV('Atharva_Fixed_IoT_Devices_Registry.csv', csvContent);
                  }}
                  className="bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Devices CSV</span>
                </button>
              </div>
            </div>

            {/* FIXED DEVICES TABLE */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-4">Device IMEI / Serial</th>
                    <th className="py-2.5 px-4">Device Type</th>
                    <th className="py-2.5 px-4">Mapped Vehicle</th>
                    <th className="py-2.5 px-4">Carrier & Signal Strength</th>
                    <th className="py-2.5 px-4">Supply / Voltage</th>
                    <th className="py-2.5 px-4">Last Heartbeat</th>
                    <th className="py-2.5 px-4">Firmware Version</th>
                    <th className="py-2.5 px-4">Diagnostics</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {fixedDevices
                    .filter((dev) => {
                      return (
                        dev.imei.includes(deviceSearchQuery) ||
                        dev.mappedPlate.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
                        dev.deviceType.toLowerCase().includes(deviceSearchQuery.toLowerCase())
                      );
                    })
                    .map((device) => (
                      <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {device.imei}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block text-[11px]">
                            {device.deviceType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-blue-900">
                          {device.mappedPlate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block text-[11px]">{device.simCarrier}</span>
                          <span className="text-slate-500 text-[10px] block">{device.signalStrength}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                          {device.supplyVoltage}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {device.lastHeartbeat}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[10px]">
                          {device.firmware}
                        </td>
                        <td className="py-3 px-4">
                          {device.diagnosticHealth === 'ONLINE' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                              ONLINE
                            </span>
                          )}
                          {device.diagnosticHealth === 'STANDBY' && (
                            <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 font-bold text-[10px]">
                              STANDBY
                            </span>
                          )}
                          {device.diagnosticHealth === 'WEAK_SIGNAL' && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 font-bold text-[10px]">
                              WEAK SIGNAL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handlePingDevice(device)}
                              disabled={pingingDeviceId === device.id}
                              className="bg-slate-100 hover:bg-[#0f5fc2] hover:text-white border border-slate-300 text-slate-700 px-2 py-1 text-[10px] font-bold transition-colors"
                            >
                              {pingingDeviceId === device.id ? 'Pinging...' : 'Ping'}
                            </button>
                            <button
                              onClick={() => handleTestSos(device)}
                              className="bg-slate-100 hover:bg-red-600 hover:text-white border border-slate-300 text-slate-700 px-2 py-1 text-[10px] font-bold transition-colors"
                            >
                              Test SOS
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS (Create Vendor, Add Vendor Team Member, Add Vehicle, Add Driver) */}
      {/* ========================================================================= */}
      
      {/* MODAL: CREATE VENDOR ORGANIZATION (Super Admin Only) */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Provision New Vendor Organization</h3>
              </div>
              <button onClick={() => setIsAddVendorModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendorSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-[11px] space-y-1">
                <strong>Super Admin Notice:</strong>
                <p>Creating this corporate vendor will provision their primary administrator credentials and grant transport portal access.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Cloud Systems India"
                  value={newVendorForm.companyName}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, companyName: e.target.value })}
                  className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Client Code *</label>
                  <input
                    type="text"
                    required
                    value={newVendorForm.vendorCode}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, vendorCode: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Fleet Quota (Cabs)</label>
                  <input
                    type="number"
                    min="1"
                    value={newVendorForm.assignedFleetQuota}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, assignedFleetQuota: Number(e.target.value) })}
                    className="w-full border border-slate-300 p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Admin Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Head of Mobility / Admin"
                    value={newVendorForm.primaryAdminName}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, primaryAdminName: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={newVendorForm.email}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold shadow-sm"
                >
                  Provision & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VENDOR TEAM MEMBER (Super Admin Only) */}
      {isAddTeamMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-lg w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Grant Access to Vendor Team Member</h3>
              </div>
              <button onClick={() => setIsAddTeamMemberModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeamMemberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Vendor Organization *</label>
                <select
                  value={newTeamMemberForm.vendorCompany}
                  onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, vendorCompany: e.target.value })}
                  className="w-full border border-slate-300 p-2 bg-white focus:outline-none focus:border-[#0f5fc2]"
                >
                  <option value="Nexus Global Enterprise Tech">Nexus Global Enterprise Tech (VND-CORP-01)</option>
                  <option value="Apex Cloud Systems">Apex Cloud Systems (VND-APEX-02)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Team member legal name"
                    value={newTeamMemberForm.name}
                    onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, name: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staff Code / Alias *</label>
                  <input
                    type="text"
                    required
                    value={newTeamMemberForm.aliasCode}
                    onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, aliasCode: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="member@enterprise.internal"
                    value={newTeamMemberForm.email}
                    onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, email: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Team Role Title *</label>
                  <input
                    type="text"
                    required
                    value={newTeamMemberForm.roleTitle}
                    onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, roleTitle: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* GRANULAR PERMISSIONS MATRIX */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-800 block uppercase text-[11px]">
                  Admin Granular Permissions Delegation:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center space-x-2 border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={newTeamMemberForm.canAllocateCabs}
                      onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, canAllocateCabs: e.target.checked })}
                    />
                    <span>Can Allocate Cabs & Routes</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={newTeamMemberForm.canViewRadar}
                      onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, canViewRadar: e.target.checked })}
                    />
                    <span>Can View Live Commute Radar</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={newTeamMemberForm.canRequestAdhoc}
                      onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, canRequestAdhoc: e.target.checked })}
                    />
                    <span>Can Request Adhoc Emergency Trips</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={newTeamMemberForm.canViewBilling}
                      onChange={(e) => setNewTeamMemberForm({ ...newTeamMemberForm, canViewBilling: e.target.checked })}
                    />
                    <span>Can View Billing & Rates</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTeamMemberModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Authorize Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {isAddVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Enrol New Vehicle to Fleet</h3>
              </div>
              <button onClick={() => setIsAddVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-03-HA-9901"
                    value={newVehicleForm.plate}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, plate: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono font-bold uppercase focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Make & Model *</label>
                  <input
                    type="text"
                    required
                    value={newVehicleForm.model}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newVehicleForm.category}
                    onChange={(e) =>
                      setNewVehicleForm({
                        ...newVehicleForm,
                        category: e.target.value as 'SUV' | 'Sedan' | 'Tempo' | 'EV',
                      })
                    }
                    className="w-full border border-slate-300 p-2 bg-white focus:outline-none"
                  >
                    <option value="SUV">SUV (Innova)</option>
                    <option value="Sedan">Sedan (Dzire)</option>
                    <option value="Tempo">Tempo Traveller</option>
                    <option value="EV">Electric Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity *</label>
                  <input
                    type="text"
                    required
                    value={newVehicleForm.seatingCapacity}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, seatingCapacity: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Driver full name"
                    value={newVehicleForm.driverName}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, driverName: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={newVehicleForm.driverPhone}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, driverPhone: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD DRIVER */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Onboard Chauffeur to Atharva Roster</h3>
              </div>
              <button onClick={() => setIsAddDriverModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriverSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staff Code *</label>
                  <input
                    type="text"
                    required
                    value={newDriverForm.staffCode}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, staffCode: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono font-bold focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Chauffeur legal name"
                    value={newDriverForm.name}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={newDriverForm.phone}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
                    className="w-full border border-slate-300 p-2 focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driving License (DL) *</label>
                  <input
                    type="text"
                    required
                    placeholder="KA0320140029101"
                    value={newDriverForm.dlNumber}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, dlNumber: e.target.value })}
                    className="w-full border border-slate-300 p-2 font-mono uppercase focus:outline-none focus:border-[#0f5fc2]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CONTRACT SLABS */}
      {selectedContractForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#0f5fc2] tracking-wider block">
                  AGREEMENT RATE CARD DETAILS
                </span>
                <h3 className="font-bold text-base text-slate-900">{selectedContractForModal.code}</h3>
              </div>
              <button onClick={() => setSelectedContractForModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 text-sm block">{selectedContractForModal.title}</span>
                <span className="text-slate-600 block">Transporter: {selectedContractForModal.transporter}</span>
                <span className="text-slate-600 block">Client Partner: {selectedContractForModal.clientPartner}</span>
                <span className="text-slate-600 block">Category: {selectedContractForModal.vehicleCategory}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 p-2.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Monthly Base Rental</span>
                  <span className="font-black text-slate-900 text-base">
                    ₹{selectedContractForModal.monthlyBaseRental.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-500 text-[10px] block">For {selectedContractForModal.monthlyBaseKm} km / month</span>
                </div>

                <div className="border border-slate-200 p-2.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Extra Km Surcharge</span>
                  <span className="font-black text-slate-900 text-base">
                    ₹{selectedContractForModal.extraKmRate} / km
                  </span>
                  <span className="text-slate-500 text-[10px] block">Beyond committed slab</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  showToast(`Generated official agreement document for ${selectedContractForModal.code}`);
                  setSelectedContractForModal(null);
                }}
                className="px-4 py-2 bg-[#0f5fc2] hover:bg-blue-700 text-white font-bold text-xs"
              >
                Download Signed PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
