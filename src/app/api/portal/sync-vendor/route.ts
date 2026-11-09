import { NextRequest, NextResponse } from 'next/server';
import { registerAccount, updateAccountAccess, ProvisionedAccount } from '@/lib/provisioned-accounts';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, account, id, isAccessGranted } = body;

    if (action === 'register' && account) {
      const newAcc: ProvisionedAccount = {
        id: account.id || `usr-vnd-${Date.now()}`,
        email: account.email.toLowerCase(),
        aliasCode: account.aliasCode || account.vendorCode || 'VND-AUTO',
        fullName: account.name,
        role: 'CORPORATE_CLIENT',
        accountType: account.userType || 'PRIMARY_VENDOR',
        companyName: account.vendorCompany || account.companyName || 'Enterprise Partner',
        clientCode: account.aliasCode || 'VND-CORP',
        deskRole: account.roleTitle || 'Corporate Transport Desk',
        assignedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
        isAccessGranted: account.isAccessGranted !== false,
        permissions: account.permissions || {
          canAllocateCabs: true,
          canViewTelemetry: true,
          canRequestAdhoc: true,
          canViewBilling: true,
          canManageRoster: true,
        },
      };

      registerAccount(newAcc);
      return NextResponse.json({ success: true, message: 'Account registered into central auth registry', account: newAcc });
    }

    if (action === 'toggle-access' && id) {
      updateAccountAccess(id, Boolean(isAccessGranted));
      return NextResponse.json({ success: true, message: 'Account access updated in central auth registry' });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

