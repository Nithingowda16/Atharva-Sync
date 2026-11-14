/**
 * Atharva Travels ETS — Employee Android App
 * Auth Service Interface (Phase 1 Frontend Placeholder)
 * 
 * Strict No-Mock-Data: No fake credentials or fake success simulation.
 * Ready to connect to central Next.js /api/auth in Phase 2.
 */

import { UserProfile } from '../types';

export interface LoginCredentials {
  identifier: string; // Employee ID or Corporate Email
  secret: string;     // Password or PIN
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
}

export const authService = {
  /**
   * Authenticate employee against Central Atharva ETS platform
   * In Phase 1 Frontend: Returns unauthenticated state with clean integration hook
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.identifier.trim() || !credentials.secret.trim()) {
      return {
        success: false,
        error: 'Please enter your Employee ID and password.',
      };
    }

    // Phase 2 will call: POST /api/auth/login
    // Phase 1: Does not simulate fake authentication
    return {
      success: false,
      error: 'Backend authentication service will be connected in Phase 2.',
    };
  },

  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    if (!identifier.trim()) {
      return {
        success: false,
        message: 'Please provide a valid Employee ID or email.',
      };
    }

    // Phase 2 hook
    return {
      success: true,
      message: 'Password reset request prepared for central server dispatch.',
    };
  },

  async logout(): Promise<void> {
    // Phase 2 hook
  },

  async getSession(): Promise<UserProfile | null> {
    // Phase 2 hook
    return null;
  },
};

