import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import WelcomeScreen from '@/screens/Auth/WelcomeScreen';
import OtpLoginScreen from '@/screens/Auth/OtpLoginScreen';
import OtpVerifyScreen from '@/screens/Auth/OtpVerifyScreen';
import PasswordLoginScreen from '@/screens/Auth/PasswordLoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="PasswordLogin" component={PasswordLoginScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
