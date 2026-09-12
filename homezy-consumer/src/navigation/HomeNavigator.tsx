import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import HomeScreen from '@/screens/Home/HomeScreen';
import SearchScreen from '@/screens/Home/SearchScreen';
import CategoryServicesScreen from '@/screens/Home/CategoryServicesScreen';
import ServiceDetailScreen from '@/screens/Home/ServiceDetailScreen';
import AddressListScreen from '@/screens/Booking/AddressListScreen';
import AddressFormScreen from '@/screens/Booking/AddressFormScreen';
import BookingConfirmScreen from '@/screens/Booking/BookingConfirmScreen';
import BookingSuccessScreen from '@/screens/Booking/BookingSuccessScreen';
import { colors } from '@/theme/theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CategoryServices"
        component={CategoryServicesScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Service' }} />
      <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: 'Select Address' }} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Address' }} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ title: 'Confirm Booking' }} />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
