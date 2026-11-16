import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { TextInput } from '../components/TextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { BrandLogo } from '../components/BrandLogo';
import { authService } from '../services/authService';

export const ForgotPassword = ({ onBack }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your Employee ID or corporate email');
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(identifier);
      setIsSent(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-black text-white flex flex-col items-center justify-between p-6 overflow-x-hidden selection:bg-[#FF7900] selection:text-white">
      {/* Top Header with Back button */}
      <div className="w-full max-w-[430px] flex items-center justify-between pt-2 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm font-semibold p-2 -ml-2 rounded-xl hover:bg-neutral-900 focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-[430px] my-auto">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="default" showTagline={false} />
        </div>

        <div className="
          w-full
          bg-[#101217]
          border border-[#222734]
          rounded-[28px]
          p-6 sm:p-7
          shadow-[0_12px_40px_rgba(0,0,0,0.85)]
          text-left
        ">
          {isSent ? (
            /* Success confirmation */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Instructions Sent</h2>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                If <span className="text-white font-medium">{identifier}</span> is registered with HI RIDERS, you will receive password reset instructions shortly.
              </p>
              <PrimaryButton onClick={onBack} fullWidth>
                Return to Login
              </PrimaryButton>
            </div>
          ) : (
            /* Reset Request Form */
            <div>
              <div className="mb-6">
                <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">
                  Reset Password
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                  Enter your registered corporate Employee ID or email to receive password recovery assistance.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                  id="reset-identifier"
                  name="identifier"
                  label="Employee ID / Email"
                  placeholder="e.g. EMP-1048 or corporate email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  error={error}
                  autoFocus
                />

                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    loading={loading}
                    fullWidth
                  >
                    <span>Send Recovery Instructions</span>
                    <span className="text-lg">→</span>
                  </PrimaryButton>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer Support Info */}
      <div className="w-full max-w-[430px] pt-4 pb-2 text-center text-xs text-neutral-500">
        Need immediate help? Contact Transport Desk at support@hiriders.internal
      </div>
    </div>
  );
};

