import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EarningsStackParamList } from './types';
import EarningsScreen from '@/screens/Home/EarningsScreen';

const Stack = createNativeStackNavigator<EarningsStackParamList>();

export default function EarningsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Earnings' }} />
    </Stack.Navigator>
  );
}
