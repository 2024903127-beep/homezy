import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import { queryClient } from '@/services/queryClient';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import ToastContainer from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function AppContent() {
  useAuthBootstrap();
  return (
    <ErrorBoundary>
      <RootNavigator />
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
