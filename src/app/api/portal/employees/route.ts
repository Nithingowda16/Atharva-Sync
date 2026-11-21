import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;

    const employees = await db.getEmployees(query);
    return NextResponse.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch employee directory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. ADD EMPLOYEE
    if (action === 'create_employee') {
      if (!body.fullName || !body.employeeCode) {
        return NextResponse.json(
          { error: 'Full Name and Employee Code are required fields.' },
          { status: 400 }
        );
      }

      const created = await db.createEmployee({
        fullName: body.fullName,
        employeeCode: body.employeeCode,
        email: body.email || `${body.employeeCode.toLowerCase()}@enterprise.com`,
        phone: body.phone || '+91 98450 11223',
        department: body.department || 'Operations',
        homeAddress: body.homeAddress || 'Bengaluru, Karnataka',
        officeCampus: body.officeCampus || 'Enterprise Tech Park, Tower B',
        gender: body.gender || 'FEMALE',
        femaleSafeguard: body.femaleSafeguard ?? (body.gender === 'FEMALE'),
        defaultShiftTime: body.defaultShiftTime || '09:00',
        pickupCoords: body.pickupCoords || { latitude: 12.9719, longitude: 77.6412 },
        actor: body.actor || 'Atharva Super Admin',
      });

      return NextResponse.json({
        success: true,
        message: `Employee ${created.fullName} (${created.employeeCode}) added to Master Directory!`,
        employee: created,
      });
    }

    // 2. REMOVE EMPLOYEE
    if (action === 'remove_employee') {
      const idOrCode = body.id || body.employeeCode;
      if (!idOrCode) {
        return NextResponse.json(
          { error: 'Employee ID or Code is required to remove an employee.' },
          { status: 400 }
        );
      }

      await db.removeEmployee(idOrCode, body.actor || 'Atharva Super Admin');

      return NextResponse.json({
        success: true,
        message: `Employee ${idOrCode} removed from Master Directory.`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error in employees API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
