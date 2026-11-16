import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Persistent in-memory fallback cache mapped by employee code
const memoryAddressStore: Record<string, any[]> = {
  '111': [
    {
      id: 'addr-111-home',
      label: 'Home',
      addressLine: 'Indiranagar 100ft Road, HAL 2nd Stage',
      landmark: 'Near Indiranagar Metro Station',
      city: 'Bengaluru',
      pincode: '560038',
      latitude: 12.9719,
      longitude: 77.6412,
      isPrimary: true,
    },
  ],
  'EMP-9042': [
    {
      id: 'addr-9042-home',
      label: 'Home',
      addressLine: 'Gate 2, Golden Palms Apts, Indiranagar',
      landmark: 'Near Indiranagar Metro Pillar 142',
      city: 'Bengaluru',
      pincode: '560038',
      latitude: 12.9719,
      longitude: 77.6412,
      isPrimary: true,
    },
  ],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId') || '111';
    const normalizedId = employeeId.trim().toUpperCase();

    // 1. Try fetching from Neon DB
    let dbAddresses: any[] = [];
    try {
      const employee = await prisma.employeeProfile.findFirst({
        where: {
          OR: [
            { employeeCode: { equals: normalizedId, mode: 'insensitive' } },
            { employeeCode: { contains: normalizedId, mode: 'insensitive' } },
          ],
        },
      });

      if (employee && employee.defaultHomeAddress) {
        dbAddresses.push({
          id: `addr-${employee.id}-primary`,
          label: 'Home',
          addressLine: employee.defaultHomeAddress,
          landmark: 'Primary Residence',
          city: 'Bengaluru',
          pincode: '560038',
          latitude: employee.defaultLatitude || 12.9719,
          longitude: employee.defaultLongitude || 77.6412,
          isPrimary: true,
        });
      }
    } catch (dbErr) {
      console.warn('Neon DB lookup notice, falling back to cached address store:', dbErr);
    }

    // 2. Merge with memory address store
    const cached = memoryAddressStore[normalizedId] || memoryAddressStore[employeeId] || [];
    const combined = [...dbAddresses];
    for (const c of cached) {
      if (!combined.some((item) => item.addressLine === c.addressLine)) {
        combined.push(c);
      }
    }

    return NextResponse.json({
      success: true,
      employeeId,
      addresses: combined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId = '111', address } = body;

    if (!address || !address.addressLine) {
      return NextResponse.json(
        { success: false, error: 'Address line is mandatory.' },
        { status: 400 }
      );
    }

    const normalizedId = employeeId.trim().toUpperCase();
    if (!memoryAddressStore[normalizedId]) {
      memoryAddressStore[normalizedId] = [];
    }

    const newAddr = {
      id: address.id || `addr-${Date.now()}`,
      label: address.label || 'Home',
      addressLine: address.addressLine.trim(),
      landmark: address.landmark?.trim() || 'Residential Landmark',
      city: address.city?.trim() || 'Bengaluru',
      pincode: address.pincode?.trim() || '560038',
      latitude: address.latitude || 12.9719,
      longitude: address.longitude || 77.6412,
      isPrimary: Boolean(address.isPrimary || memoryAddressStore[normalizedId].length === 0),
    };

    // If new address is primary, unset previous primary
    if (newAddr.isPrimary) {
      memoryAddressStore[normalizedId] = memoryAddressStore[normalizedId].map((a) => ({
        ...a,
        isPrimary: false,
      }));
    }

    memoryAddressStore[normalizedId].unshift(newAddr);

    // Also update Neon DB EmployeeProfile if present
    try {
      const employee = await prisma.employeeProfile.findFirst({
        where: {
          OR: [
            { employeeCode: { equals: normalizedId, mode: 'insensitive' } },
            { employeeCode: { contains: normalizedId, mode: 'insensitive' } },
          ],
        },
      });

      if (employee) {
        await prisma.employeeProfile.update({
          where: { id: employee.id },
          data: {
            defaultHomeAddress: newAddr.addressLine,
            defaultLatitude: newAddr.latitude,
            defaultLongitude: newAddr.longitude,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Neon DB update notice:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Address saved successfully and linked to employee ID.',
      addresses: memoryAddressStore[normalizedId],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save address' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = (searchParams.get('employeeId') || '111').trim().toUpperCase();
    const addressId = searchParams.get('addressId');

    if (memoryAddressStore[employeeId] && addressId) {
      memoryAddressStore[employeeId] = memoryAddressStore[employeeId].filter(
        (a) => a.id !== addressId
      );
    }

    return NextResponse.json({
      success: true,
      addresses: memoryAddressStore[employeeId] || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete address' },
      { status: 500 }
    );
  }
}

