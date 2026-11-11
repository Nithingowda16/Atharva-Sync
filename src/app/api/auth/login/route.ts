import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  signSessionToken,
  setAuthCookie,
  UserSessionPayload,
} from '@/lib/auth';
import { findAccount, getAllAccounts } from '@/lib/provisioned-accounts';

export const dynamic = 'force-dynamic';

// ============================================================================
// STRICT RESTRICTED ACCESS CONFIGURATION
// Only 3 designated Super Administrators are authorized to access the system:
// 1. harish.admin@atharvatravels.com
// 2. bhaskar.admin@atharvatravels.com
// 3. hemaraj.admin@atharvatravels.com
// Password: admin@atharvatravels
// ============================================================================
const REQUIRED_PASSWORD = 'admin@atharvatravels';

const AUTHORIZED_ADMIN_EMAILS = [
  'harish.admin@atharvatravels.com',
  'bhaskar.admin@atharvatravels.com',
  'hemaraj.admin@atharvatravels.com',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, roleTarget } = body;

    // 1. Basic validation
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email / Staff Code and password are required' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim().toLowerCase();

    // 2. Check Admin-Controlled Provisioned Store
    const matched = findAccount(trimmed);

    // 3. Strict Authorization Check: Only the 3 authorized admins are allowed
    if (!matched || !AUTHORIZED_ADMIN_EMAILS.includes(matched.email.toLowerCase())) {
      return NextResponse.json(
        {
          error:
            'Access Denied: Restricted access portal. Access is strictly limited to authorized Atharva administrators.',
        },
        { status: 403 }
      );
    }

    // 4. Strict Password Verification
    const isCorrectPassword = password === REQUIRED_PASSWORD;
    if (!isCorrectPassword) {
      return NextResponse.json(
        { error: 'Invalid password. Authentication rejected.' },
        { status: 401 }
      );
    }

    const authenticatedUser = {
      id: matched.id,
      fullName: matched.fullName,
      email: matched.email,
      role: matched.role,
      accountType: matched.accountType,
      companyName: matched.companyName,
      clientCode: matched.clientCode,
      staffCode: matched.staffCode,
      deskRole: matched.deskRole,
      assignedByAdmin: matched.assignedByAdmin,
      permissions: matched.permissions,
      isAccessGranted: matched.isAccessGranted,
    };

    // 5. Generate Cryptographically Signed JWT Token
    const sessionPayload: UserSessionPayload = {
      sub: authenticatedUser.id,
      email: authenticatedUser.email,
      fullName: authenticatedUser.fullName,
      role: authenticatedUser.role,
      clientCode: authenticatedUser.clientCode,
      staffCode: authenticatedUser.staffCode,
    };

    const token = signSessionToken(sessionPayload);

    // 6. Prepare Response with Secure HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Access granted.',
      user: authenticatedUser,
      targetPortal: 'admin-portal',
    });

    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Fatal Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Authentication Service Error' },
      { status: 500 }
    );
  }
}
