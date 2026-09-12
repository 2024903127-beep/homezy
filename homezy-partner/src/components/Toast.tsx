import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

type ToastHandler = (opts: ToastOptions) => void;

let _handler: ToastHandler | null = null;

// Call Toast.show() from anywhere in the app
export const Toast = {
  show: (opts: ToastOptions) => {
    _handler?.(opts);
  },
};

const BG: Record<ToastType, string> = {
  success: '#059669',
  error: '#DC2626',
  info: '#1A73E8',
};

export function ToastProvider() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    _handler = ({ message: msg, type: t = 'success', duration = 2500 }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setType(t);
      setVisible(true);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          setVisible(false);
        });
      }, duration);
    };
    return () => { _handler = null; };
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: BG[type], opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  text: { ...typography.bodyBold, color: colors.white, textAlign: 'center' },
});
