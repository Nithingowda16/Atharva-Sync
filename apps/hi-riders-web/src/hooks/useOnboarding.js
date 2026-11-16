import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hi_riders_onboarding_completed';

export const useOnboarding = (totalSteps = 3) => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [currentStep, setCurrentStep] = useState(0);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset onboarding state:', e);
    }
    setIsOnboarded(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return {
    isOnboarded,
    currentStep,
    setStep: setCurrentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    resetOnboarding,
  };
};

