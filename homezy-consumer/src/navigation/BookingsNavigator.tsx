import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingsStackParamList } from './types';
import BookingHistoryScreen from '@/screens/Booking/BookingHistoryScreen';
import BookingTrackingScreen from '@/screens/Booking/BookingTrackingScreen';
import RateBookingScreen from '@/screens/Booking/RateBookingScreen';
import { colors } from '@/theme/theme';

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export default function BookingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} options={{ title: 'My Bookings' }} />
      <Stack.Screen name="BookingTracking" component={BookingTrackingScreen} options={{ title: 'Track Booking' }} />
      <Stack.Screen name="RateBooking" component={RateBookingScreen} options={{ title: 'Rate Service' }} />
    </Stack.Navigator>
  );
}
