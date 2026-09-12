import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import DashboardScreen from '@/screens/Home/DashboardScreen';
import JobDetailScreen from '@/screens/Jobs/JobDetailScreen';
import NavigationScreen from '@/screens/Home/NavigationScreen';
import { colors } from '@/theme/theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text, headerShadowVisible: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
      <Stack.Screen name="Navigation" component={NavigationScreen} options={{ title: 'Directions & Address' }} />
    </Stack.Navigator>
  );
}
