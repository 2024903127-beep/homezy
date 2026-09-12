import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { colors, typography } from '@/theme/theme';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ),
    ]).start();
  }, [opacity, pulse, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, { transform: [{ scale: Animated.multiply(scale, pulse) }], opacity }]}>
        <Icon name="home" size={52} color={colors.white} />
      </Animated.View>
      <Animated.Text style={[styles.brand, { opacity }]}>Homezy</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity }]}>Your home, perfectly cared for</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brand: {
    ...typography.h1,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.75)',
  },
});
