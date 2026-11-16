import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { PaginationDots } from './PaginationDots';

export const OnboardingLayout = ({
  currentStep = 0,
  totalSteps = 3,
  onNext,
  onPrev,
  onSkip,
  children,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-gradient-to-b from-orange-600/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-20"></div>
      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-gradient-to-t from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-20"></div>

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 pt-7 pb-2 w-full max-w-md mx-auto">
        <div>
          {!isFirstStep && (
            <button
              onClick={onPrev}
              type="button"
              className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={onSkip}
          type="button"
          className="text-neutral-400 hover:text-[#FF7900] text-sm font-semibold tracking-wide transition-colors py-1.5 px-3 rounded-full hover:bg-neutral-900 focus:outline-none"
        >
          Skip
        </button>
      </header>

      {/* Main Slide Body */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 w-full max-w-md mx-auto py-2">
        {children}
      </main>

      {/* Bottom Navigation: Pagination + Circular Action Button */}
      <footer className="relative z-20 flex items-center justify-between px-7 pb-10 pt-4 w-full max-w-md mx-auto">
        {/* Pagination Dots */}
        <PaginationDots total={totalSteps} current={currentStep} />

        {/* Circular Orange Next / Proceed Button */}
        <button
          onClick={onNext}
          type="button"
          className="
            group
            w-14 h-14
            rounded-full
            bg-gradient-to-tr from-[#F4510B] to-[#FF7900]
            hover:from-[#ff5914] hover:to-[#ff8d22]
            text-white
            flex items-center justify-center
            shadow-[0_0_25px_rgba(255,121,0,0.45)]
            active:scale-95
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-[#FF7900] focus:ring-offset-2 focus:ring-offset-black
          "
          aria-label={isLastStep ? 'Complete onboarding and proceed to login' : 'Next slide'}
        >
          <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </footer>
    </div>
  );
};

