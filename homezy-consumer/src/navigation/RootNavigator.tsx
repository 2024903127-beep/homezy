import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuthStore } from '@/store/authStore';
import SplashScreen from '@/screens/SplashScreen';
import { useNotifications } from '@/hooks/useNotifications';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationContent() {
  useNotifications();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <SplashScreen />;
  }

  return (
    <AppErrorBoundary>
      <NavigationContainer>
        <NavigationContent />
      </NavigationContainer>
    </AppErrorBoundary>
  );
}
