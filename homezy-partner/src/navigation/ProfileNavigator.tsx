import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import EditProfileScreen from '@/screens/Profile/EditProfileScreen';
import KycScreen from '@/screens/Profile/KycScreen';
import BankDetailsScreen from '@/screens/Profile/BankDetailsScreen';
import ServiceAreasScreen from '@/screens/Profile/ServiceAreasScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="Kyc" component={KycScreen} options={{ title: 'KYC & Documents' }} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} options={{ title: 'Bank Details' }} />
      <Stack.Screen name="ServiceAreas" component={ServiceAreasScreen} options={{ title: 'Skills & Coverage' }} />
    </Stack.Navigator>
  );
}
