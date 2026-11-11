import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserSession, clearAuthCookie, AUTHORIZED_ADMIN_EMAILS } from '@/lib/auth';
import { findAccount } from '@/lib/provisioned-accounts';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUserSession();

    // 1. Must have a valid session
    if (!session || !session.email) {
      const response = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
      clearAuthCookie(response);
      return response;
    }

    const emailLower = session.email.toLowerCase().trim();

    // 2. Strict Check: Must be in the authorized 3 administrators list
    if (!AUTHORIZED_ADMIN_EMAILS.includes(emailLower)) {
      console.warn(`Unauthorized session attempt detected for: ${session.email}. Revoking cookie.`);
      const response = NextResponse.json(
        { authenticated: false, user: null, error: 'Unauthorized account revoked' },
        { status: 403 }
      );
      clearAuthCookie(response);
      return response;
    }

    // 3. Lookup provisioned admin record
    const account = findAccount(emailLower);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: account?.id || session.sub,
        email: emailLower,
        fullName: account?.fullName || session.fullName || 'Atharva Administrator',
        role: 'ATHARVA_ADMIN',
        companyName: 'Atharva Travels Pvt Ltd',
        staffCode: account?.staffCode || session.staffCode || 'ATH-ADMIN-01',
        deskRole: account?.deskRole || 'Super Administrator',
      },
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    const response = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    clearAuthCookie(response);
    return response;
  }
}
