import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from './prisma';
import { UserRole } from '@/types/ets';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'atharva-travels-production-super-strong-jwt-secret-2026';
const JWT_EXPIRES_IN = '8h';
const AUTH_COOKIE_NAME = 'atharva_ets_session';

// Max failed attempts before 15-minute lock
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Dummy hash for constant-time comparison against timing side-channel attacks
const DUMMY_HASH = '$2a$12$K8y4ySgM8g4N0D9h8.Z4keqH5E7m8Qj0.1V5F3x8Q1e3p8z5w8y6u';

export interface UserSessionPayload {
  sub: string;
  email: string;
  fullName: string;
  role: UserRole;
  clientCode?: string;
  staffCode?: string;
}

/**
 * 1. Strong Password Hashing with 12 Salt Rounds
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 12);
}

/**
 * 2. Timing-Safe Password Comparison
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * 3. Constant-Time Dummy Verification (Prevents User Enumeration via Timing Attacks)
 */
export async function timingSafeDummyCheck(plainText: string): Promise<void> {
  await bcrypt.compare(plainText, DUMMY_HASH);
}

/**
 * 4. Password Strength Validator
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  return { valid: true };
}

/**
 * 5. Sign Cryptographically Secure JWT
 */
export function signSessionToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'atharva-travels-ets',
    audience: 'atharva-ets-portal',
  });
}

/**
 * 6. Verify and Decrypt JWT Session Token
 */
export function verifySessionToken(token: string): UserSessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'atharva-travels-ets',
      audience: 'atharva-ets-portal',
    }) as UserSessionPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * 7. Brute-Force Rate Limiting & Account Lockout Guard
 */
export async function checkAccountLockout(emailOrCode: string): Promise<{ isLocked: boolean; remainingMinutes?: number }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrCode },
          { employeeProfile: { employeeCode: emailOrCode } },
          { atharvaAdminProfile: { staffCode: emailOrCode } },
          { corporateClientProfile: { clientCode: emailOrCode } },
        ],
      },
      select: { lockedUntil: true, failedLoginAttempts: true },
    });

    if (!user || !user.lockedUntil) {
      return { isLocked: false };
    }

    const now = new Date();
    if (user.lockedUntil > now) {
      const remainingMs = user.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      return { isLocked: true, remainingMinutes };
    }

    // Lock has expired, reset it
    await prisma.user.updateMany({
      where: {
        OR: [{ email: emailOrCode }],
      },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
      },
    });

    return { isLocked: false };
  } catch (err) {
    console.error('Lockout check error:', err);
    return { isLocked: false };
  }
}

/**
 * 8. Record Login Success (Audit Log & Counter Reset)
 */
export async function recordLoginSuccess(userId: string, ipAddress: string, userAgent?: string) {
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        },
      }),
      prisma.loginAuditLog.create({
        data: {
          userId,
          attemptedUser: userId,
          success: true,
          ipAddress,
          userAgent: userAgent || null,
        },
      }),
    ]);
  } catch (err) {
    console.error('Error logging success:', err);
  }
}

/**
 * 9. Record Login Failure (Increment Counter & Enforce Lockout)
 */
export async function recordLoginFailure(
  attemptedUser: string,
  ipAddress: string,
  reason: string,
  userAgent?: string
) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: attemptedUser },
          { atharvaAdminProfile: { staffCode: attemptedUser } },
          { corporateClientProfile: { clientCode: attemptedUser } },
        ],
      },
    });

    if (user) {
      const newAttempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        },
      });

      await prisma.loginAuditLog.create({
        data: {
          userId: user.id,
          attemptedUser,
          role: user.role,
          success: false,
          failureReason: lockedUntil ? `Account Locked (${reason})` : reason,
          ipAddress,
          userAgent: userAgent || null,
        },
      });
    } else {
      await prisma.loginAuditLog.create({
        data: {
          attemptedUser,
          success: false,
          failureReason: `Unknown user: ${reason}`,
          ipAddress,
          userAgent: userAgent || null,
        },
      });
    }
  } catch (err) {
    console.error('Error logging failure:', err);
  }
}

/**
 * 10. Set Secure HttpOnly Session Cookie on Response
 */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

/**
 * 11. Clear Session Cookie on Logout
 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

/**
 * 12. Extract Current User from Request Headers/Cookies (Server Components/Route Handlers)
 */
export async function getCurrentUserSession(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

