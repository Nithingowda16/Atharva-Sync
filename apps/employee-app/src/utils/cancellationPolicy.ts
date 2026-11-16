/**
 * Atharva Travels ETS — Employee Android App
 * Corporate Commute Cancellation & Cutoff Policy
 * 
 * Rule: Cancellations are permitted strictly up to 6 hours before scheduled shift reporting time.
 * If less than 6 hours remain, cancellations are locked to ensure vehicle routing stability.
 */

export interface CancellationCheckResult {
  eligible: boolean;
  hoursRemaining: number;
  message: string;
}

export function checkCancellationEligibility(dateStr: string, shiftTime: string): CancellationCheckResult {
  try {
    const parts = shiftTime.trim().split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    if (parts[1]?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (parts[1]?.toUpperCase() === 'AM' && hours === 12) hours = 0;

    // Build target datetime
    const targetDateTime = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
    const now = new Date();
    const diffMs = targetDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return {
        eligible: false,
        hoursRemaining: 0,
        message: 'Shift time has already elapsed. Ride cannot be cancelled.',
      };
    }

    if (diffHours < 6) {
      const roundedHrs = Math.round(diffHours * 10) / 10;
      return {
        eligible: false,
        hoursRemaining: roundedHrs,
        message: `Cancellation window closed (${roundedHrs}h to shift). Corporate policy allows cancellation only up to 6 hours before reporting. Please contact Transport Desk (1800-ATHARVA).`,
      };
    }

    const roundedHrs = Math.round(diffHours * 10) / 10;
    return {
      eligible: true,
      hoursRemaining: roundedHrs,
      message: `Eligible for cancellation (${roundedHrs}h remaining before 6h cutoff).`,
    };
  } catch (e) {
    return {
      eligible: true,
      hoursRemaining: 24,
      message: 'Eligible for cancellation.',
    };
  }
}

