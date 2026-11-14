/**
 * Ambient type definitions for React Native and Expo modules
 * Allows TypeScript type checking and IDE intellisense before `npm install`
 */

declare module 'react-native' {
  export const StyleSheet: any;
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const TouchableWithoutFeedback: any;
  export const ScrollView: any;
  export const SafeAreaView: any;
  export const TextInput: any;
  export const Modal: any;
  export const KeyboardAvoidingView: any;
  export const Animated: any;
  export const ActivityIndicator: any;
  export const Dimensions: any;
  export const Platform: any;
  export const RefreshControl: any;
  export const Switch: any;
  export const Alert: any;
  export const BackHandler: any;
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
  export const useSafeAreaInsets: () => { top: number; bottom: number; left: number; right: number };
}

declare module '@expo/vector-icons' {
  export const Ionicons: any;
  export const MaterialCommunityIcons: any;
  export const Feather: any;
}
