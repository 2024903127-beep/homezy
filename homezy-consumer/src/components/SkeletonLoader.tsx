import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme/theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonLoader({ width = '100%', height = 16, borderRadius = radius.sm, style }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.shimmer, colors.shimmerHighlight],
  });

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as any, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader width={56} height={56} borderRadius={radius.md} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonLoader height={16} width="70%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={12} width="50%" />
      </View>
    </View>
  );
}

export function SkeletonCategoryTile() {
  return (
    <View style={styles.categoryCard}>
      <SkeletonLoader width={62} height={62} borderRadius={16} style={{ marginBottom: 10 }} />
      <SkeletonLoader height={14} width="85%" style={{ marginBottom: 8 }} />
      <SkeletonLoader height={18} width="50%" borderRadius={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  categoryCard: {
    width: '48.2%',
    height: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDEB',
    justifyContent: 'space-between',
  },
  tile: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
});
