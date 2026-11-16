import React, { useState } from 'react';
import { TextInput } from '../components/TextInput';
import { PasswordInput } from '../components/PasswordInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { authService } from '../services/authService';
import heroBanner from '../assets/illustrations/login_hero.png';

export const Login = ({ onLoginSuccess, onForgotPassword }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Employee ID or email is required';
    }
    if (!password.trim()) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await authService.login({ identifier, password });
      if (result.success) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-black text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden selection:bg-[#FF7900] selection:text-white">
      {/* Background Ambient Glows & Accents */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-600/20 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-28 -mt-20"></div>
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-700/15 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none -ml-28 -mb-20"></div>

      {/* Mobile Screen Container (Constrained width for phone proportions) */}
      <div className="relative z-10 w-full max-w-[430px] flex flex-col flex-1 pb-8">
        {/* Top Hero Section: HI RIDERS Emblem + Tagline + SUV & Road Sunset */}
        <div className="w-full flex flex-col items-center pt-2 px-3">
          <div className="relative w-full overflow-hidden flex items-center justify-center">
            <img
              src={heroBanner}
              alt="HI RIDERS Enterprise Transport Mobility"
              className="w-full max-h-[340px] sm:max-h-[380px] object-contain select-none drop-shadow-2xl"
              draggable={false}
              loading="eager"
            />
          </div>
        </div>

        {/* Employee Login Card (Overlaps subtly onto the road illustration bottom) */}
        <div className="px-5 -mt-6 sm:-mt-8 w-full">
          <div className="
            w-full
            bg-[#101217]/95
            backdrop-blur-xl
            border border-[#222734]
            rounded-[28px]
            p-6 sm:p-7
            shadow-[0_12px_40px_rgba(0,0,0,0.85)]
          ">
            {/* Card Heading */}
            <div className="mb-6 text-left">
              <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">
                Employee Login
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                Sign in with your corporate employee credentials to view assigned shifts and commute routes.
              </p>
            </div>

            {/* Error Notification Banner */}
            {authError && (
              <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-left flex items-start gap-2.5">
                <span className="text-red-400 text-sm leading-snug">{authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Field 1: Employee ID / Email */}
              <TextInput
                id="employee-identifier"
                name="identifier"
                label="Employee ID / Email"
                placeholder="e.g. EMP-1048 or corporate email"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
                  if (authError) setAuthError(null);
                }}
                error={errors.identifier}
                autoFocus
              />

              {/* Field 2: Password / PIN */}
              <PasswordInput
                id="employee-password"
                name="password"
                label="Password / PIN"
                placeholder="Enter your security password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  if (authError) setAuthError(null);
                }}
                error={errors.password}
              />

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5 pb-2">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs sm:text-sm font-semibold text-[#FF7900] hover:text-orange-400 transition-colors focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <PrimaryButton
                type="submit"
                loading={isLoading}
                fullWidth
              >
                <span>Sign In</span>
                <span className="text-lg">→</span>
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

