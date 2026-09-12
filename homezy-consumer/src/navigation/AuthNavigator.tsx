import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { AuthStackParamList } from './types';
import OnboardingScreen from '@/screens/Onboarding/OnboardingScreen';
import LoginScreen from '@/screens/Auth/LoginScreen';
import OtpVerifyScreen from '@/screens/Auth/OtpVerifyScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof AuthStackParamList | null>(null);

  useEffect(() => {
    async function checkOnboarded() {
      try {
        const hasSeen = await SecureStore.getItemAsync('homezy_onboarded');
        setInitialRoute(hasSeen ? 'Login' : 'Onboarding');
      } catch {
        setInitialRoute('Onboarding');
      }
    }
    checkOnboarded();
  }, []);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
}
