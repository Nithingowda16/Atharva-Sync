import { PrismaClient, UserRole, TripType, TripStatus, BoardingStatus, DriverDutyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Atharva Travels Enterprise Transport System (ETS) Database...');

  // Hash password for demo accounts
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // --------------------------------------------------------------------------
  // 1. Corporate Client (Walmart Global Tech) & Vendor Facilities Admin
  // --------------------------------------------------------------------------
  const corporateUser = await prisma.user.upsert({
    where: { email: 'facilities.head@walmart.internal' },
    update: {},
    create: {
      email: 'facilities.head@walmart.internal',
      passwordHash: defaultPasswordHash,
      fullName: 'Vikramaditya Hegde',
      phoneNumber: '+91-98800-11223',
      role: UserRole.CORPORATE_CLIENT,
      corporateClientProfile: {
        create: {
          companyName: 'Walmart Global Tech India',
          clientCode: 'WMT-BLR',
          billingEntity: 'Walmart India Private Limited',
          contractTier: 'ENTERPRISE_PREMIUM',
          allocatedBudget: 1250000.0,
          primaryCampus: 'Bengaluru Tech Park, Tower B (Outer Ring Road)',
        },
      },
    },
    include: {
      corporateClientProfile: true,
    },
  });

  const corporateClientId = corporateUser.corporateClientProfile!.id;
  console.log(`✅ Seeded Corporate Client: ${corporateUser.corporateClientProfile!.companyName}`);

  // --------------------------------------------------------------------------
  // 2. Atharva Travels Master Admin (Fleet Operations & Central Command)
  // --------------------------------------------------------------------------
  const atharvaAdmin = await prisma.user.upsert({
    where: { email: 'ops.manager@atharvatravels.com' },
    update: {},
    create: {
      email: 'ops.manager@atharvatravels.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Atharva Deshmukh',
      phoneNumber: '+91-99000-88776',
      role: UserRole.ATHARVA_ADMIN,
      atharvaAdminProfile: {
        create: {
          staffCode: 'ATH-OPS-01',
          deskRole: 'Operations General Manager & Dispatch Lead',
          shiftZone: 'Bengaluru Central, Indiranagar & Bellandur Zones',
          canDispatchQRT: true,
        },
      },
    },
  });
  console.log(`✅ Seeded Atharva Admin: ${atharvaAdmin.fullName}`);

  // --------------------------------------------------------------------------
  // 3. Atharva Fleet Vehicles
  // --------------------------------------------------------------------------
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: 'KA-03-HA-8821' },
    update: {},
    create: {
      plateNumber: 'KA-03-HA-8821',
      make: 'Toyota',
      model: 'Innova Crysta 2.4 VX',
      color: 'Pearl White',
      seatingCapacity: 4,
      fleetType: 'PREMIUM_MUV',
      gpsDeviceId: 'GPS-ATH-8821',
      insuranceExpiry: new Date('2027-12-31'),
      fitnessExpiry: new Date('2028-06-30'),
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: 'KA-05-MJ-4310' },
    update: {},
    create: {
      plateNumber: 'KA-05-MJ-4310',
      make: 'Toyota',
      model: 'Innova Crysta',
      color: 'Silver Grey',
      seatingCapacity: 4,
      fleetType: 'PREMIUM_MUV',
      gpsDeviceId: 'GPS-ATH-4310',
      insuranceExpiry: new Date('2027-10-15'),
      fitnessExpiry: new Date('2028-04-20'),
    },
  });
  console.log('✅ Seeded Fleet Vehicles');

  // --------------------------------------------------------------------------
  // 4. Drivers (Drivers connected via Driver Mobile App)
  // --------------------------------------------------------------------------
  const driverUser1 = await prisma.user.upsert({
    where: { email: 'suresh.babu@atharvatravels.com' },
    update: {},
    create: {
      email: 'suresh.babu@atharvatravels.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Suresh Babu',
      phoneNumber: '+91-98765-43210',
      role: UserRole.DRIVER,
      driverProfile: {
        create: {
          licenseNumber: 'KA-03-2018-009124',
          licenseExpiry: new Date('2032-05-15'),
          rating: 4.92,
          totalTripsCompleted: 840,
          dutyStatus: DriverDutyStatus.ON_TRIP,
          currentLatitude: 12.9760,
          currentLongitude: 77.6320,
          currentHeading: 45.0,
          currentSpeed: 32.5,
          lastLocationUpdate: new Date(),
          assignedVehicleId: vehicle1.id,
        },
      },
    },
  });

  const driverUser2 = await prisma.user.upsert({
    where: { email: 'mahesh.gowda@atharvatravels.com' },
    update: {},
    create: {
      email: 'mahesh.gowda@atharvatravels.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Mahesh Gowda',
      phoneNumber: '+91-98441-23456',
      role: UserRole.DRIVER,
      driverProfile: {
        create: {
          licenseNumber: 'KA-05-2016-004412',
          licenseExpiry: new Date('2030-08-20'),
          rating: 4.85,
          totalTripsCompleted: 1120,
          dutyStatus: DriverDutyStatus.AVAILABLE,
          currentLatitude: 12.9850,
          currentLongitude: 77.7200,
          currentHeading: 90.0,
          currentSpeed: 0.0,
          lastLocationUpdate: new Date(),
          assignedVehicleId: vehicle2.id,
        },
      },
    },
  });
  console.log('✅ Seeded Atharva Drivers');

  // --------------------------------------------------------------------------
  // 5. Employees (Employees connected via Employee Mobile App)
  // --------------------------------------------------------------------------
  const empUser1 = await prisma.user.upsert({
    where: { email: 'amrutha.rao@walmart.internal' },
    update: {},
    create: {
      email: 'amrutha.rao@walmart.internal',
      passwordHash: defaultPasswordHash,
      fullName: 'Amrutha Rao',
      phoneNumber: '+91-98450-11223',
      role: UserRole.EMPLOYEE,
      employeeProfile: {
        create: {
          employeeCode: 'EMP-9042',
          department: 'Core Supply Chain & Logistics Engineering',
          corporateClientId: corporateClientId,
          defaultHomeAddress: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road, Bengaluru',
          defaultLatitude: 12.9719,
          defaultLongitude: 77.6412,
          femaleSafeguard: true,
          emergencyContactName: 'Ramesh Rao (Spouse)',
          emergencyContactPhone: '+91-98450-99887',
        },
      },
    },
  });

  const empUser2 = await prisma.user.upsert({
    where: { email: 'priya.sharma@walmart.internal' },
    update: {},
    create: {
      email: 'priya.sharma@walmart.internal',
      passwordHash: defaultPasswordHash,
      fullName: 'Priya Sharma',
      phoneNumber: '+91-98711-22334',
      role: UserRole.EMPLOYEE,
      employeeProfile: {
        create: {
          employeeCode: 'EMP-9018',
          department: 'Product Management',
          corporateClientId: corporateClientId,
          defaultHomeAddress: 'HAL 2nd Stage, 80ft Road, Indiranagar',
          defaultLatitude: 12.9800,
          defaultLongitude: 77.6250,
          femaleSafeguard: true,
          emergencyContactName: 'Anil Sharma (Father)',
          emergencyContactPhone: '+91-98711-55667',
        },
      },
    },
  });

  const empUser3 = await prisma.user.upsert({
    where: { email: 'karthik.natarajan@walmart.internal' },
    update: {},
    create: {
      email: 'karthik.natarajan@walmart.internal',
      passwordHash: defaultPasswordHash,
      fullName: 'Karthik Natarajan',
      phoneNumber: '+91-99887-33445',
      role: UserRole.EMPLOYEE,
      employeeProfile: {
        create: {
          employeeCode: 'EMP-9033',
          department: 'DevOps & Cloud Infrastructure',
          corporateClientId: corporateClientId,
          defaultHomeAddress: 'Domlur Layout, Inner Ring Road, Bengaluru',
          defaultLatitude: 12.9620,
          defaultLongitude: 77.6480,
          femaleSafeguard: false,
          emergencyContactName: 'Revathi N. (Sister)',
          emergencyContactPhone: '+91-99887-11223',
        },
      },
    },
  });
  console.log('✅ Seeded Corporate Employees');

  // --------------------------------------------------------------------------
  // 6. Active Morning Pickup Trip (Trip #ATH-8821)
  // --------------------------------------------------------------------------
  const today = new Date();
  today.setHours(7, 30, 0, 0);

  const trip = await prisma.trip.upsert({
    where: { tripCode: 'ATH-8821' },
    update: {},
    create: {
      tripCode: 'ATH-8821',
      type: TripType.PICKUP,
      status: TripStatus.EN_ROUTE,
      scheduledStartTime: today,
      scheduledEndTime: new Date(today.getTime() + 50 * 60 * 1000), // +50 mins
      actualStartTime: new Date(today.getTime() - 10 * 60 * 1000),
      vehicleId: vehicle1.id,
      driverId: driverUser1.id,
      totalDistanceKm: 14.8,
      estimatedMinutes: 38,
      passengers: {
        create: [
          {
            employeeId: empUser2.id, // Priya Sharma (Picked Up)
            stopSequence: 1,
            scheduledPickupTime: new Date(today.getTime() - 5 * 60 * 1000),
            actualPickupTime: new Date(today.getTime() - 4 * 60 * 1000),
            pickupAddress: 'HAL 2nd Stage, 80ft Road',
            pickupLatitude: 12.9800,
            pickupLongitude: 77.6250,
            dropAddress: 'Walmart Global Tech, Tower B, Bellandur',
            dropLatitude: 12.9352,
            dropLongitude: 77.6946,
            boardingOtp: '3190',
            boardingStatus: BoardingStatus.BOARDED,
            boardedAt: new Date(today.getTime() - 4 * 60 * 1000),
          },
          {
            employeeId: empUser1.id, // Amrutha Rao (Next stop)
            stopSequence: 2,
            scheduledPickupTime: new Date(today.getTime() + 7 * 60 * 1000),
            pickupAddress: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
            pickupLatitude: 12.9719,
            pickupLongitude: 77.6412,
            dropAddress: 'Walmart Global Tech, Tower B, Bellandur',
            dropLatitude: 12.9352,
            dropLongitude: 77.6946,
            boardingOtp: '7492',
            boardingStatus: BoardingStatus.SCHEDULED,
          },
          {
            employeeId: empUser3.id, // Karthik Natarajan (Upcoming stop)
            stopSequence: 3,
            scheduledPickupTime: new Date(today.getTime() + 18 * 60 * 1000),
            pickupAddress: 'Domlur Layout, Inner Ring Road',
            pickupLatitude: 12.9620,
            pickupLongitude: 77.6480,
            dropAddress: 'Walmart Global Tech, Tower B, Bellandur',
            dropLatitude: 12.9352,
            dropLongitude: 77.6946,
            boardingOtp: '5821',
            boardingStatus: BoardingStatus.SCHEDULED,
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded Active Trip: ${trip.tripCode} with 3 passengers & boarding PINs`);
  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

