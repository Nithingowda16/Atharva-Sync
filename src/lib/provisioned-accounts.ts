/**
 * Atharva Travels Enterprise Transport System - Shared Account Registry
 * STRICT RESTRICTED ACCESS: Limited solely to 3 designated Super Administrators.
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

// ============================================================================
// ONLY 3 AUTHORIZED ACCOUNTS PERMITTED TO ACCESS THE SYSTEM
// Password: admin@atharvatravels
// ============================================================================
export const BASE_PROVISIONED_ACCOUNTS: ProvisionedAccount[] = [
  // 1. Harish - Super Admin
  {
    id: 'usr-atharva-harish',
    email: 'harish.admin@atharvatravels.com',
    aliasCode: 'ATH-ADMIN-HARISH',
    fullName: 'Harish R.',
    role: 'ATHARVA_ADMIN',
    accountType: 'SUPER_ADMIN',
    companyName: 'Atharva Travels Pvt Ltd',
    staffCode: 'ATH-HARISH-01',
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

  // 2. Bhaskar - Super Admin
  {
    id: 'usr-atharva-bhaskar',
    email: 'bhaskar.admin@atharvatravels.com',
    aliasCode: 'ATH-ADMIN-BHASKAR',
    fullName: 'Bhaskar N.',
    role: 'ATHARVA_ADMIN',
    accountType: 'SUPER_ADMIN',
    companyName: 'Atharva Travels Pvt Ltd',
    staffCode: 'ATH-BHASKAR-01',
    deskRole: 'Fleet Logistics Command & Super Admin',
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

  // 3. Hemaraj - Super Admin
  {
    id: 'usr-atharva-hemaraj',
    email: 'hemaraj.admin@atharvatravels.com',
    aliasCode: 'ATH-ADMIN-HEMARAJ',
    fullName: 'Hemaraj K.',
    role: 'ATHARVA_ADMIN',
    accountType: 'SUPER_ADMIN',
    companyName: 'Atharva Travels Pvt Ltd',
    staffCode: 'ATH-HEMARAJ-01',
    deskRole: 'Statutory Compliance & Super Admin',
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

  // 4. Rohan Mehra - Vendor Billing Auditor
  {
    id: 'usr-vnd-billing-audit',
    email: 'billing.audit@enterprise.internal',
    aliasCode: 'VND-TEAM-04',
    fullName: 'Rohan Mehra',
    role: 'CORPORATE_CLIENT',
    accountType: 'VENDOR_TEAM_MEMBER',
    companyName: 'Nexus Global Enterprise Tech',
    clientCode: 'VND-CORP-01',
    staffCode: 'VND-TEAM-04',
    deskRole: 'Commute Billing & Kilometric Auditor (Vendor Team)',
    assignedByAdmin: 'ATH-ADMIN-01 (Atharva Super Admin)',
    isAccessGranted: true,
    permissions: {
      canAllocateCabs: false,
      canViewTelemetry: false,
      canRequestAdhoc: false,
      canViewBilling: true,
      canManageRoster: false,
    },
  },
];

// Initialize global storage with the 3 authorized accounts
if (!(global as any).__ATHARVA_PROVISIONED_ACCOUNTS__) {
  (global as any).__ATHARVA_PROVISIONED_ACCOUNTS__ = [...BASE_PROVISIONED_ACCOUNTS];
}

export function getAllAccounts(): ProvisionedAccount[] {
  if (!(global as any).__ATHARVA_PROVISIONED_ACCOUNTS__) {
    (global as any).__ATHARVA_PROVISIONED_ACCOUNTS__ = [...BASE_PROVISIONED_ACCOUNTS];
  }
  return (global as any).__ATHARVA_PROVISIONED_ACCOUNTS__;
}

export function findAccount(identifier: string): ProvisionedAccount | undefined {
  const trimmed = identifier.trim().toLowerCase();
  const accounts: ProvisionedAccount[] = getAllAccounts();
  return accounts.find(
    (u) =>
      u.email.toLowerCase() === trimmed ||
      u.aliasCode.toLowerCase() === trimmed ||
      (u.staffCode && u.staffCode.toLowerCase() === trimmed)
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
