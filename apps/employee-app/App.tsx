/**
 * Atharva Travels ETS — Employee Android App
 * Root Application Entry Point
 * 
 * Safe Area support, light corporate status bar, and root AppNavigator.
 */

import React from 'react';
import { StyleSheet, View, AppRegistry } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

// Ensure the root component is registered with both Expo and React Native AppRegistry ("main")
registerRootComponent(App);
AppRegistry.registerComponent('main', () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

