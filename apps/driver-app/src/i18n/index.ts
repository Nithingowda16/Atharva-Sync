/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Multilingual Translations: English (en), Kannada (kn), Hindi (hi)
 */

import { Language } from '../types';

export const translations = {
  en: {
    // App Branding
    appName: 'HR Pilot',
    appTagline: 'Hi Riders Enterprise Transport System',
    
    // Auth & Check-in
    loginTitle: 'Driver Sign In',
    loginSubtitle: 'Enter your registered Driver ID or Phone & PIN',
    driverIdPlaceholder: 'Driver ID (e.g. DRV-8821)',
    phonePlaceholder: 'Mobile Number',
    pinPlaceholder: '4-Digit PIN',
    signInButton: 'Log In to Fleet',
    vehicleCheckinTitle: 'Pre-Shift Vehicle Inspection',
    vehicleCheckinSubtitle: 'Verify your assigned cab before going on duty',
    plateNumber: 'Plate Number',
    model: 'Vehicle Model',
    startOdometer: 'Current Odometer (km)',
    enterOdometer: 'Enter odometer reading',
    acWorking: 'AC & Air Blower Working',
    cleanCab: 'Cab Cleaned & Sanitized',
    fuelCheck: 'Fuel Level Adequate (> 50%)',
    documentsValid: 'Fitness & Insurance Valid',
    confirmCheckin: 'Confirm & Go Online',
    
    // Duty Status
    dutyOnline: 'ON DUTY',
    dutyOffline: 'OFF DUTY',
    goOnline: 'Slide to Go Online',
    goOffline: 'Go Offline',
    readyForRoster: 'Ready for assigned roster shifts',
    offlineStatusText: 'You are currently offline. Go online to receive trip manifests.',

    // Trips & Manifest
    activeManifest: "Today's Assigned Manifest",
    noActiveTrips: 'No active trips right now',
    noTripsSubtitle: 'You will be notified as soon as dispatch assigns your next shift roster.',
    tripCode: 'Trip Code',
    shiftTime: 'Shift Time',
    loginShift: 'Morning Login Shift',
    logoutShift: 'Evening Logout Shift',
    rentalzShift: 'Atharva Rentalz Shift',
    flexiShift: 'Flexi Catchup Shift',
    totalDistance: 'Total Distance',
    totalStops: 'Total Stops',
    startTripButton: 'Start Route',
    inTransit: 'IN TRANSIT',
    scheduled: 'SCHEDULED',
    completed: 'COMPLETED',
    
    // Navigation & Passenger Stops
    currentStop: 'CURRENT STOP',
    upcomingStops: 'UPCOMING PASSENGERS',
    callPassenger: 'Call',
    navigateGmaps: 'Maps',
    arrivedPoint: 'I have arrived',
    arrivedAlertTitle: 'Arrival Recorded',
    arrivedAlertBody: 'Passenger notified that cab has arrived at the designated pickup.',
    scanQrBtn: 'Scan QR Code',
    enterOtpBtn: 'Enter OTP',
    verifyBoarding: 'Verify Boarding',
    passengerBoarded: 'Boarded',
    passengerWaiting: 'Waiting',
    passengerNoShow: 'No-Show',
    reassignedBadge: 'Reassigned Pickup',
    
    // Boarding Modal
    boardingTitle: 'Passenger Boarding Verification',
    scanQrSubtitle: 'Point camera at employee boarding pass QR code',
    enterOtpSubtitle: 'Enter employee 4-digit secret boarding OTP',
    verifyOtpButton: 'Confirm Boarding',
    invalidOtp: 'Invalid 4-digit OTP. Please ask employee for correct PIN.',
    cameraPermissionDenied: 'Camera permission is required to scan boarding passes.',
    switchToOtp: 'Enter OTP Manually',
    switchToCamera: 'Use Camera Scanner',
    
    // No-Show Flow
    reportNoShow: 'Report No-Show',
    noShowDialogTitle: 'Report Passenger No-Show?',
    noShowDialogBody: 'Ensure you have waited at the pickup location for at least 5 minutes and attempted to call the passenger.',
    confirmNoShowBtn: 'Mark as No-Show & Proceed',
    cancel: 'Cancel',
    
    // Trip Completion
    endTripTitle: 'Trip Destination Reached',
    endTripSubtitle: 'Confirm all corporate employees have safely deboarded',
    endOdometer: 'End Odometer (km)',
    enterEndOdometer: 'Enter final odometer reading',
    womenSafetyConfirm: 'Women Passenger Safe Drop Confirmed',
    completeTripBtn: 'Complete & Submit Trip',
    tripFinishedSuccess: 'Trip ATH completed successfully. Manifest synchronized.',
    
    // Offline Engine
    offlineBannerTitle: 'Offline Mode Active',
    offlineBannerSub: 'Working with cached manifest. Actions will sync automatically.',
    pendingSyncCount: 'updates queued for dispatch sync',
    syncNow: 'Sync Now',
    onlineBanner: 'Online • Real-Time Telemetry Active',
    
    // Emergency SOS
    sosButton: 'EMERGENCY SOS',
    sosTitle: '24/7 Command Desk Emergency',
    sosSubtitle: 'Tap below to connect instantly with Atharva Central Operations',
    sosCallButton: 'Call 24/7 Command Helpline',
    sosEscalateButton: 'Broadcast Panic GPS Alert',
    sosEscalatedAlert: 'Emergency GPS alert sent to Atharva Dispatch & Corporate Security.',
    
    // Profile & Settings
    driverProfile: 'Pilot Profile',
    driverRating: 'Rating',
    tripsCompleted: 'Trips Completed',
    licenseNumber: 'Commercial License',
    licenseExpiry: 'License Expiry',
    assignedVehicle: 'Assigned Cab',
    changeLanguage: 'Language / ಭಾಷೆ / भाषा',
    english: 'English',
    kannada: 'ಕನ್ನಡ (Kannada)',
    hindi: 'हिन्दी (Hindi)',
    logoutButton: 'Log Out',
  },

  kn: {
    // App Branding
    appName: 'HR Pilot (ಎಚ್‌ಆರ್ ಪೈಲಟ್)',
    appTagline: 'ಹೈ ರೈಡರ್ಸ್ ಎಂಟರ್‌ಪ್ರೈಸ್ ಸಾರಿಗೆ ವ್ಯವಸ್ಥೆ',
    
    // Auth & Check-in
    loginTitle: 'ಚಾಲಕರ ಲಾಗಿನ್',
    loginSubtitle: 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಡ್ರೈವರ್ ಐಡಿ ಅಥವಾ ಫೋನ್ & ಪಿನ್ ನಮೂದಿಸಿ',
    driverIdPlaceholder: 'ಡ್ರೈವರ್ ಐಡಿ (ಉದಾ. DRV-8821)',
    phonePlaceholder: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    pinPlaceholder: '4-ಅಂಕಿಯ ಪಿನ್ (PIN)',
    signInButton: 'ಫ್ಲೀಟ್‌ಗೆ ಲಾಗಿನ್ ಆಗಿ',
    vehicleCheckinTitle: 'ಶಿಫ್ಟ್ ಪೂರ್ವ ವಾಹನ ಪರಿಶೀಲನೆ',
    vehicleCheckinSubtitle: 'ಡ್ಯೂಟಿ ಪ್ರಾರಂಭಿಸುವ ಮುನ್ನ ನಿಮ್ಮ ನಿಗದಿತ ಕ್ಯಾಬ್ ಪರಿಶೀಲಿಸಿ',
    plateNumber: 'ವಾಹನ ಸಂಖ್ಯೆ',
    model: 'ವಾಹನ ಮಾದರಿ',
    startOdometer: 'ಪ್ರಸ್ತುತ ಓಡೋಮೀಟರ್ (ಕಿ.ಮೀ)',
    enterOdometer: 'ಓಡೋಮೀಟರ್ ರೀಡಿಂಗ್ ನಮೂದಿಸಿ',
    acWorking: 'AC & ಏರ್ ಬ್ಲೋವರ್ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ',
    cleanCab: 'ಕ್ಯಾಬ್ ಸ್ವಚ್ಛವಾಗಿದೆ & ಸ್ಯಾನಿಟೈಸ್ ಆಗಿದೆ',
    fuelCheck: 'ಇಂಧನ ಮಟ್ಟ ಸರಿಯಾಗಿದೆ (> 50%)',
    documentsValid: 'ಫಿಟ್‌ನೆಸ್ & ವಿಮೆ ಮಾನ್ಯವಾಗಿದೆ',
    confirmCheckin: 'ದೃಢೀಕರಿಸಿ & ಆನ್‌ಲೈನ್ ಹೋಗಿ',
    
    // Duty Status
    dutyOnline: 'ಆನ್ ಡ್ಯೂಟಿ',
    dutyOffline: 'ಆಫ್ ಡ್ಯೂಟಿ',
    goOnline: 'ಆನ್‌ಲೈನ್‌ಗೆ ಸ್ಲೈಡ್ ಮಾಡಿ',
    goOffline: 'ಆಫ್‌ಲೈನ್ ಹೋಗಿ',
    readyForRoster: 'ನಿಗದಿತ ಶಿಫ್ಟ್‌ಗಳಿಗೆ ಸಿದ್ಧವಾಗಿದೆ',
    offlineStatusText: 'ನೀವು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಟ್ರಿಪ್ ಪಡೆಯಲು ಆನ್‌ಲೈನ್ ಹೋಗಿ.',

    // Trips & Manifest
    activeManifest: 'ಇಂದಿನ ನಿಯೋಜಿತ ಟ್ರಿಪ್ ಪಟ್ಟಿ',
    noActiveTrips: 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಟ್ರಿಪ್ ಇಲ್ಲ',
    noTripsSubtitle: 'ಕಂಟ್ರೋಲ್ ರೂಮ್‌ನಿಂದ ಮುಂದಿನ ಶಿಫ್ಟ್ ನಿಯೋಜಿಸಿದ ತಕ್ಷಣ ನಿಮಗೆ ಮಾಹಿತಿ ಬರುತ್ತದೆ.',
    tripCode: 'ಟ್ರಿಪ್ ಕೋಡ್',
    shiftTime: 'ಶಿಫ್ಟ್ ಸಮಯ',
    loginShift: 'ಬೆಳಗಿನ ಲಾಗಿನ್ ಶಿಫ್ಟ್',
    logoutShift: 'ಸಂಜೆಯ ಲಾಗೌಟ್ ಶಿಫ್ಟ್',
    rentalzShift: 'ಅಥರ್ವ ರೆಂಟಲ್ಸ್ ಶಿಫ್ಟ್',
    flexiShift: 'ಫ್ಲೆಕ್ಸಿ ಕ್ಯಾಚ್ಅಪ್ ಶಿಫ್ಟ್',
    totalDistance: 'ಒಟ್ಟು ದೂರ',
    totalStops: 'ಒಟ್ಟು ನಿಲುಗಡೆಗಳು',
    startTripButton: 'ಮಾರ್ಗ ಪ್ರಾರಂಭಿಸಿ',
    inTransit: 'ಪ್ರಯಾಣದಲ್ಲಿದೆ',
    scheduled: 'ನಿಗದಿಯಾಗಿದೆ',
    completed: 'ಮುಕ್ತಾಯವಾಗಿದೆ',
    
    // Navigation & Passenger Stops
    currentStop: 'ಪ್ರಸ್ತುತ ನಿಲುಗಡೆ',
    upcomingStops: 'ಮುಂದಿನ ಪ್ರಯಾಣಿಕರು',
    callPassenger: 'ಕರೆ ಮಾಡಿ',
    navigateGmaps: 'ಮ್ಯಾಪ್ಸ್',
    arrivedPoint: 'ನಾನು ತಲುಪಿದ್ದೇನೆ',
    arrivedAlertTitle: 'ಆಗಮನ ದಾಖಲಾಗಿದೆ',
    arrivedAlertBody: 'ಕ್ಯಾಬ್ ನಿಗದಿತ ಸ್ಥಳಕ್ಕೆ ತಲುಪಿದೆ ಎಂದು ಉದ್ಯೋಗಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ.',
    scanQrBtn: 'QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    enterOtpBtn: 'OTP ನಮೂದಿಸಿ',
    verifyBoarding: 'ಬೋರ್ಡಿಂಗ್ ದೃಢೀಕರಿಸಿ',
    passengerBoarded: 'ಹತ್ತಿದ್ದಾರೆ',
    passengerWaiting: 'ಕಾಯುತ್ತಿದ್ದಾರೆ',
    passengerNoShow: 'ಗೈರುಹಾಜರಿ',
    reassignedBadge: 'ಬದಲಾದ ಪಿಕಪ್',
    
    // Boarding Modal
    boardingTitle: 'ಪ್ರಯಾಣಿಕರ ಬೋರ್ಡಿಂಗ್ ದೃಢೀಕರಣ',
    scanQrSubtitle: 'ಉದ್ಯೋಗಿಯ QR ಕೋಡ್ ಕಡೆ ಕ್ಯಾಮೆರಾ ತೋರಿಸಿ',
    enterOtpSubtitle: 'ಉದ್ಯೋಗಿಯ 4-ಅಂಕಿಯ ಗೌಪ್ಯ OTP ನಮೂದಿಸಿ',
    verifyOtpButton: 'ಬೋರ್ಡಿಂಗ್ ದೃಢೀಕರಿಸಿ',
    invalidOtp: 'ತಪ್ಪು OTP. ದಯವಿಟ್ಟು ಸರಿಯಾದ PIN ಕೇಳಿ.',
    cameraPermissionDenied: 'QR ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ.',
    switchToOtp: 'OTP ಮೂಲಕ ನಮೂದಿಸಿ',
    switchToCamera: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ',
    
    // No-Show Flow
    reportNoShow: 'ಗೈರುಹಾಜರಿ ವರದಿ ಮಾಡಿ',
    noShowDialogTitle: 'ಪ್ರಯಾಣಿಕರು ಗೈರುಹಾಜರೇ?',
    noShowDialogBody: 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ 5 ನಿಮಿಷ ಕಾಯಿರಿ ಮತ್ತು ಪ್ರಯಾಣಿಕರಿಗೆ ಕರೆ ಮಾಡಲು ಪ್ರಯತ್ನಿಸಿ.',
    confirmNoShowBtn: 'ಗೈರುಹಾಜರಿ ಗುರುತಿಸಿ & ಮುಂದುವರಿಯಿರಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    
    // Trip Completion
    endTripTitle: 'ಗಮ್ಯಸ್ಥಾನ ತಲುಪಿದೆ',
    endTripSubtitle: 'ಎಲ್ಲಾ ಉದ್ಯೋಗಿಗಳು ಸುರಕ್ಷಿತವಾಗಿ ಇಳಿದಿದ್ದಾರೆಯೇ ಎಂದು ದೃಢೀಕರಿಸಿ',
    endOdometer: 'ಅಂತಿಮ ಓಡೋಮೀಟರ್ (ಕಿ.ಮೀ)',
    enterEndOdometer: 'ಅಂತಿಮ ಓಡೋಮೀಟರ್ ರೀಡಿಂಗ್ ನಮೂದಿಸಿ',
    womenSafetyConfirm: 'ಮಹಿಳಾ ಪ್ರಯಾಣಿಕರ ಸುರಕ್ಷಿತ ಡ್ರಾಪ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    completeTripBtn: 'ಟ್ರಿಪ್ ಪೂರ್ಣಗೊಳಿಸಿ',
    tripFinishedSuccess: 'ಟ್ರಿಪ್ ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.',
    
    // Offline Engine
    offlineBannerTitle: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    offlineBannerSub: 'ಸ್ಥಳೀಯ ಮಾಹಿತಿಯೊಂದಿಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ. ನೆಟ್‌ವರ್ಕ್ ಬಂದಾಗ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.',
    pendingSyncCount: 'ಅಪ್‌ಡೇಟ್‌ಗಳು ಸಿಂಕ್ ಮಾಡಲು ಬಾಕಿ ಇವೆ',
    syncNow: 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ',
    onlineBanner: 'ಆನ್‌ಲೈನ್ • ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    
    // Emergency SOS
    sosButton: 'ತುರ್ತು SOS',
    sosTitle: '24/7 ಕಮಾಂಡ್ ಡೆಸ್ಕ್ ತುರ್ತು ಸಹಾಯ',
    sosSubtitle: 'ಅಥರ್ವ ಕಂಟ್ರೋಲ್ ರೂಮ್ ಜೊತೆ ತಕ್ಷಣ ಮಾತನಾಡಲು ಕೆಳಗೆ ಒತ್ತಿ',
    sosCallButton: '24/7 ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ',
    sosEscalateButton: 'ತುರ್ತು GPS ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ',
    sosEscalatedAlert: 'ಅಥರ್ವ ಕಂಟ್ರೋಲ್ ರೂಮ್ & ಸೆಕ್ಯುರಿಟಿಗೆ ಎಮರ್ಜೆನ್ಸಿ GPS ಸಂದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ.',
    
    // Profile & Settings
    driverProfile: 'ಪೈಲಟ್ ಪ್ರೊಫೈಲ್',
    driverRating: 'ರೇಟಿಂಗ್',
    tripsCompleted: 'ಪೂರ್ಣಗೊಳಿಸಿದ ಟ್ರಿಪ್‌ಗಳು',
    licenseNumber: 'ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್',
    licenseExpiry: 'ಲೈಸೆನ್ಸ್ ಮಾನ್ಯತೆ',
    assignedVehicle: 'ನಿಗದಿತ ಕ್ಯಾಬ್',
    changeLanguage: 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    hindi: 'हिन्दी',
    logoutButton: 'ಲಾಗೌಟ್ ಮಾಡಿ',
  },

  hi: {
    // App Branding
    appName: 'HR Pilot (एचआर पायलट)',
    appTagline: 'हाई राइडर्स एंटरप्राइज ड्राइवर सिस्टम',
    
    // Auth & Check-in
    loginTitle: 'ड्राइवर साइन इन',
    loginSubtitle: 'अपना रजिस्टर्ड ड्राइवर आईडी या फ़ोन और पिन दर्ज करें',
    driverIdPlaceholder: 'ड्राइवर आईडी (उदा. DRV-8821)',
    phonePlaceholder: 'मोबाइल नंबर',
    pinPlaceholder: '4-अंकों का पिन (PIN)',
    signInButton: 'फ्लीट में लॉगिन करें',
    vehicleCheckinTitle: 'ड्यूटी-पूर्व वाहन निरीक्षण',
    vehicleCheckinSubtitle: 'ड्यूटी शुरू करने से पहले अपनी गाड़ी की जांच करें',
    plateNumber: 'गाड़ी नंबर',
    model: 'गाड़ी का मॉडल',
    startOdometer: 'वर्तमान ओडोमीटर (कि.मी.)',
    enterOdometer: 'ओडोमीटर रीडिंग दर्ज करें',
    acWorking: 'AC और ब्लोअर ठीक चल रहा है',
    cleanCab: 'कैब साफ और सैनिटाइज है',
    fuelCheck: 'ईंधन स्तर पर्याप्त है (> 50%)',
    documentsValid: 'फिटनेस और बीमा वैध है',
    confirmCheckin: 'पुष्टि करें और ऑनलाइन जाएं',
    
    // Duty Status
    dutyOnline: 'ऑन ड्यूटी',
    dutyOffline: 'ऑफ ड्यूटी',
    goOnline: 'ऑनलाइन जाने के लिए स्लाइड करें',
    goOffline: 'ऑफलाइन जाएं',
    readyForRoster: 'निर्धारित शिफ्ट के लिए तैयार',
    offlineStatusText: 'आप वर्तमान में ऑफलाइन हैं। ट्रिप प्राप्त करने के लिए ऑनलाइन जाएं।',

    // Trips & Manifest
    activeManifest: 'आज की आवंटित ट्रिप सूची',
    noActiveTrips: 'वर्तमान में कोई सक्रिय ट्रिप नहीं है',
    noTripsSubtitle: 'कंट्रोल रूम से अगली शिफ्ट आवंटित होते ही आपको सूचित किया जाएगा।',
    tripCode: 'ट्रिप कोड',
    shiftTime: 'शिफ्ट समय',
    loginShift: 'सुबह की लॉगिन शिफ्ट',
    logoutShift: 'शाम की लॉगआउट शिफ्ट',
    rentalzShift: 'अथर्व रेंटल्स शिफ्ट',
    flexiShift: 'फ्लेक्सी कैचअप शिफ्ट',
    totalDistance: 'कुल दूरी',
    totalStops: 'कुल स्टॉप्स',
    startTripButton: 'रूट शुरू करें',
    inTransit: 'यात्रा जारी है',
    scheduled: 'शेड्यूल है',
    completed: 'पूर्ण',
    
    // Navigation & Passenger Stops
    currentStop: 'वर्तमान स्टॉप',
    upcomingStops: 'आगामी यात्री',
    callPassenger: 'कॉल करें',
    navigateGmaps: 'मैप्स',
    arrivedPoint: 'मैं पहुंच गया हूं',
    arrivedAlertTitle: 'आगमन दर्ज किया गया',
    arrivedAlertBody: 'यात्री को सूचित किया गया कि कैब पिकअप स्थल पर पहुंच चुकी है।',
    scanQrBtn: 'QR स्कैन करें',
    enterOtpBtn: 'OTP दर्ज करें',
    verifyBoarding: 'बोर्डिंग की पुष्टि करें',
    passengerBoarded: 'सवार हुए',
    passengerWaiting: 'प्रतीक्षा में',
    passengerNoShow: 'अनुपस्थित (नो-शो)',
    reassignedBadge: 'बदला हुआ पिकअप',
    
    // Boarding Modal
    boardingTitle: 'यात्री बोर्डिंग सत्यापन',
    scanQrSubtitle: 'कर्मचारी के QR कोड पर कैमरा दिखाएं',
    enterOtpSubtitle: 'कर्मचारी का 4-अंकों का गोपनीय OTP दर्ज करें',
    verifyOtpButton: 'बोर्डिंग की पुष्टि करें',
    invalidOtp: 'गलत OTP. कृपया कर्मचारी से सही PIN पूछें।',
    cameraPermissionDenied: 'QR स्कैन करने के लिए कैमरा अनुमति आवश्यक है।',
    switchToOtp: 'OTP द्वारा दर्ज करें',
    switchToCamera: 'कैमरा स्कैनर का उपयोग करें',
    
    // No-Show Flow
    reportNoShow: 'नो-शो रिपोर्ट करें',
    noShowDialogTitle: 'यात्री अनुपस्थित हैं?',
    noShowDialogBody: 'कृपया कम से कम 5 मिनट प्रतीक्षा करें और यात्री को कॉल करने का प्रयास करें।',
    confirmNoShowBtn: 'नो-शो चिह्नित करें और आगे बढ़ें',
    cancel: 'रद्द करें',
    
    // Trip Completion
    endTripTitle: 'गंतव्य पर पहुंचे',
    endTripSubtitle: 'पुष्टि करें कि सभी कर्मचारी सुरक्षित उतर चुके हैं',
    endOdometer: 'अंतिम ओडोमीटर (कि.मी.)',
    enterEndOdometer: 'अंतिम ओडोमीटर रीडिंग दर्ज करें',
    womenSafetyConfirm: 'महिला यात्री सुरक्षित ड्रॉप की पुष्टि की गई',
    completeTripBtn: 'ट्रिप समाप्त करें',
    tripFinishedSuccess: 'ट्रिप सफलतापूर्वक पूर्ण हुई।',
    
    // Offline Engine
    offlineBannerTitle: 'ऑफलाइन मोड सक्रिय है',
    offlineBannerSub: 'लोकल डेटा के साथ काम कर रहे हैं। नेटवर्क आने पर सिंक होगा।',
    pendingSyncCount: 'अपडेट सिंक के लिए कतार में हैं',
    syncNow: 'अभी सिंक करें',
    onlineBanner: 'ऑनलाइन • लाइव ट्रैकिंग सक्रिय',
    
    // Emergency SOS
    sosButton: 'आपातकालीन SOS',
    sosTitle: '24/7 कमांड डेस्क आपातकालीन सहायता',
    sosSubtitle: 'अथर्व कंट्रोल रूम से तुरंत संपर्क करने के लिए नीचे टैप करें',
    sosCallButton: '24/7 हेल्पलाइन पर कॉल करें',
    sosEscalateButton: 'आपातकालीन GPS अलर्ट भेजें',
    sosEscalatedAlert: 'अथर्व कंट्रोल रूम और सुरक्षा टीम को इमरजेंसी GPS अलर्ट भेजा गया।',
    
    // Profile & Settings
    driverProfile: 'पायलट प्रोफाइल',
    driverRating: 'रेटिंग',
    tripsCompleted: 'पूर्ण की गई ट्रिप्स',
    licenseNumber: 'ड्राइविंग लाइसेंस',
    licenseExpiry: 'लाइसेंस वैधता',
    assignedVehicle: 'आवंटित कैब',
    changeLanguage: 'भाषा बदलें',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    hindi: 'हिन्दी',
    logoutButton: 'लॉगआउट करें',
  },
};

export type TranslationKey = keyof typeof translations.en;
