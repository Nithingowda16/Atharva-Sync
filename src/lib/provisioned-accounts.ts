/**
 * Atharva Travels Enterprise Transport System - Shared Account Registry
 * Super Admin is Root Authority. Dynamically registered vendor teams persist in memory.
 */

export interface ProvisionedAccount {
  id: string;
  email: string;
  aliasCode: string;
  fullName: string;
  role: 'ATHARVA_ADMIN' | 'CORPORATE_CLIENT';
  accountType: 'SUPER_ADMIN' | 'PRIMARY_VENDOR' | 'VENDOR_TEAM_MEMBER';
  companyName: string;
  clientCode?: string;
  staffCode?: string;
  deskRole: string;
  assignedByAdmin: string;
  isAccessGranted: boolean;
  permissions: {
    canAllocateCabs: boolean;
    canViewTelemetry: boolean;
    canRequestAdhoc: boolean;
    canViewBilling: boolean;
    canManageRoster: boolean;
  };
  passwordHash?: string;
}

export const BASE_PROVISIONED_ACCOUNTS: ProvisionedAccount[] = [
  // 1. Super Admin (The Main Central Authority)
  {
    id: 'usr-atharva-superadmin-1',
    email: 'admin@atharvatravels.com',
    aliasCode: 'ATH-ADMIN-01',
    fullName: 'Atharva Central Super Admin',
    role: 'ATHARVA_ADMIN',
    accountType: 'SUPER_ADMIN',
    companyName: 'Atharva Travels Pvt Ltd',
    staffCode: 'ATH-ADMIN-01',
    deskRole: 'Chief Transport Commissioner & Super Admin',
    assignedByAdmin: 'ROOT_AUTHORITY',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: true,
      canViewTelemetry: true,
      canRequestAdhoc: true,
      canViewBilling: true,
      canManageRoster: true,
    },
  },
  {
    id: 'usr-atharva-ops-1',
    email: 'ops.manager@atharvatravels.com',
    aliasCode: 'ATH-OPS-01',
    fullName: 'Raghavendra Kulkarni',
    role: 'ATHARVA_ADMIN',
    accountType: 'SUPER_ADMIN',
    companyName: 'Atharva Travels Pvt Ltd',
    staffCode: 'ATH-OPS-01',
    deskRole: 'Senior Fleet Dispatch Officer',
    assignedByAdmin: 'ATH-ADMIN-01',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: true,
      canViewTelemetry: true,
      canRequestAdhoc: true,
      canViewBilling: true,
      canManageRoster: true,
    },
  },

  // 2. Primary Vendor (Access Granted by Atharva Super Admin)
  {
    id: 'usr-vendor-primary-1',
    email: 'vendor.lead@enterprise.internal',
    aliasCode: 'VND-CORP-01',
    fullName: 'Arjun Nambiar',
    role: 'CORPORATE_CLIENT',
    accountType: 'PRIMARY_VENDOR',
    companyName: 'Nexus Global Enterprise Tech',
    clientCode: 'VND-CORP-01',
    deskRole: 'Head of Workplace Mobility (Vendor)',
    assignedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: true,
      canViewTelemetry: true,
      canRequestAdhoc: true,
      canViewBilling: true,
      canManageRoster: true,
    },
  },

  // 3. Vendor Team Member 1 (Shift Dispatch Lead - Provisioned by Admin)
  {
    id: 'usr-vendor-team-1',
    email: 'transport.coord@enterprise.internal',
    aliasCode: 'VND-TEAM-01',
    fullName: 'Divya Shanmugam',
    role: 'CORPORATE_CLIENT',
    accountType: 'VENDOR_TEAM_MEMBER',
    companyName: 'Nexus Global Enterprise Tech',
    clientCode: 'VND-CORP-01',
    deskRole: 'Shift Commute Operations Coordinator (Vendor Team)',
    assignedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: true,
      canViewTelemetry: true,
      canRequestAdhoc: true,
      canViewBilling: false, // Restricted by admin
      canManageRoster: true,
    },
  },

  // 4. Vendor Team Member 2 (Helpdesk Representative - Provisioned by Admin)
  {
    id: 'usr-vendor-team-2',
    email: 'helpdesk@enterprise.internal',
    aliasCode: 'VND-TEAM-02',
    fullName: 'Karthik Sundaram',
    role: 'CORPORATE_CLIENT',
    accountType: 'VENDOR_TEAM_MEMBER',
    companyName: 'Nexus Global Enterprise Tech',
    clientCode: 'VND-CORP-01',
    deskRole: 'Employee Commute Helpdesk (Vendor Team)',
    assignedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: false, // Restricted by admin
      canViewTelemetry: true,
      canRequestAdhoc: true,
      canViewBilling: false, // Restricted by admin
      canManageRoster: false,
    },
  },
];

// Process-wide global store so newly provisioned accounts persist in the running server
if (!(global as any).__ATHARVA_PROVISIONED_ACCOUNTS__) {
  (global as any).__ATHARVA_PROVISIONED_ACCOUNTS__ = [...BASE_PROVISIONED_ACCOUNTS];
}

export function getAllAccounts(): ProvisionedAccount[] {
  return (global as any).__ATHARVA_PROVISIONED_ACCOUNTS__;
}

export function findAccount(identifier: string): ProvisionedAccount | undefined {
  const trimmed = identifier.trim().toLowerCase();
  const accounts: ProvisionedAccount[] = getAllAccounts();
  return accounts.find(
    (u) =>
      u.email.toLowerCase() === trimmed ||
      u.aliasCode.toLowerCase() === trimmed ||
      (u.staffCode && u.staffCode.toLowerCase() === trimmed) ||
      (u.clientCode && u.clientCode.toLowerCase() === trimmed)
  );
}

export function registerAccount(account: ProvisionedAccount): void {
  const accounts: ProvisionedAccount[] = getAllAccounts();
  const existingIdx = accounts.findIndex(
    (a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }
}

export function updateAccountAccess(id: string, isAccessGranted: boolean): void {
  const accounts: ProvisionedAccount[] = getAllAccounts();
  const acc = accounts.find((a) => a.id === id);
  if (acc) {
    acc.isAccessGranted = isAccessGranted;
  }
}
