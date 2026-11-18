/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Root Component
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
