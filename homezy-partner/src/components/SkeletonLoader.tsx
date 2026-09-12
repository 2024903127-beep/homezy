import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme/theme';

function Bone({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius.sm,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Bone width="60%" height={16} />
        <Bone width={60} height={20} />
      </View>
      <Bone width="40%" height={13} style={{ marginTop: 8 }} />
      <Bone width="70%" height={13} style={{ marginTop: 6 }} />
      <View style={[styles.row, { marginTop: 10 }]}>
        <Bone width={120} height={12} />
        <Bone width={50} height={12} />
      </View>
    </View>
  );
}

export function EarningSkeleton() {
  return (
    <View style={styles.earningCard}>
      <Bone width="50%" height={14} />
      <Bone width={80} height={13} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
});
