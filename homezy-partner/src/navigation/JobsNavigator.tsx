import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsStackParamList } from './types';
import JobHistoryScreen from '@/screens/Jobs/JobHistoryScreen';
import JobDetailScreen from '@/screens/Jobs/JobDetailScreen';

const Stack = createNativeStackNavigator<JobsStackParamList>();

export default function JobsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="JobHistory" component={JobHistoryScreen} options={{ title: 'Job History' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
    </Stack.Navigator>
  );
}
