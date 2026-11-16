import React, { useState, useRef } from 'react';
import { OnboardingLayout } from '../components/OnboardingLayout';

import heroImg1 from '../assets/illustrations/onboarding_hero_1.png';
import heroImg2 from '../assets/illustrations/onboarding_hero_2.png';
import heroImg3 from '../assets/illustrations/onboarding_hero_3.png';

const ONBOARDING_SLIDES = [
  {
    id: 1,
    image: heroImg1,
    imageAlt: 'Smart Corporate Transport with modern SUV and sunset skyline',
    imageHeight: 'h-52 md:h-64',
    heading: 'Smart Corporate Transport',
    description: 'A centralized mobility solution for your organization.',
  },
  {
    id: 2,
    image: heroImg2,
    imageAlt: 'Manage Shifts and Schedules glowing calendar',
    imageHeight: 'h-48 md:h-56',
    heading: 'Manage Shifts & Schedules',
    description: 'View assigned shifts, pickup timings and routes in real time.',
  },
  {
    id: 3,
    image: heroImg3,
    imageAlt: 'Track and Stay Informed live GPS route map',
    imageHeight: 'h-48 md:h-56',
    heading: 'Track & Stay Informed',
    description: 'Get live trip updates, driver details and instant notifications.',
  },
];

export const Onboarding = ({
  currentStep = 0,
  onNext,
  onPrev,
  onSkip,
}) => {
  const [touchStartX, setTouchStartX] = useState(null);
  const [slideDirection, setSlideDirection] = useState('right');

  const currentSlide = ONBOARDING_SLIDES[currentStep] || ONBOARDING_SLIDES[0];

  // Touch Swipe Handlers for smooth mobile gestures
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // Swiped left -> Next slide
      setSlideDirection('right');
      onNext();
    } else if (diff < -50) {
      // Swiped right -> Previous slide
      setSlideDirection('left');
      onPrev();
    }
    setTouchStartX(null);
  };

  const handleNextWithDirection = () => {
    setSlideDirection('right');
    onNext();
  };

  const handlePrevWithDirection = () => {
    setSlideDirection('left');
    onPrev();
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={ONBOARDING_SLIDES.length}
      onNext={handleNextWithDirection}
      onPrev={handlePrevWithDirection}
      onSkip={onSkip}
    >
      <div
        className="w-full h-full flex flex-col justify-between"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Dynamic Slide Content with animated slide transition */}
        <div
          key={currentStep}
          className={`flex flex-col items-center justify-between flex-1 ${
            slideDirection === 'right' ? 'slide-enter-right' : 'slide-enter-left'
          }`}
        >
          {/* Illustration Container */}
          <div className="flex-1 w-full flex items-center justify-center py-4 my-auto">
            <div className="relative group max-w-[280px] w-full flex items-center justify-center">
              {/* Subtle ambient orange halo behind illustrations */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 via-orange-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none transform scale-90"></div>
              
              <img
                src={currentSlide.image}
                alt={currentSlide.imageAlt}
                className={`relative z-10 w-full ${currentSlide.imageHeight} object-contain select-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]`}
                loading="eager"
                draggable={false}
              />
            </div>
          </div>

          {/* Text Container */}
          <div className="w-full text-left pt-2 pb-6 px-1">
            <h1 className="text-white text-[28px] md:text-[32px] font-extrabold tracking-tight leading-[1.2] mb-3">
              {currentSlide.heading}
            </h1>
            <p className="text-neutral-400 text-sm md:text-base font-normal leading-relaxed max-w-[95%]">
              {currentSlide.description}
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

