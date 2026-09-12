import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(16)).current;
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rippleLoop = Animated.loop(
      Animated.timing(ripple, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );

    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(tagY, { toValue: 0, duration: 380, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();

    rippleLoop.start();
    return () => rippleLoop.stop();
  }, []);

  const rippleStyle = {
    opacity: ripple.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.12, 0] }),
    transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A73E8', '#0F5BC4', '#0A47A0']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      <View style={[styles.decCircle, { width: 280, height: 280, top: -80, right: -60, opacity: 0.1 }]} />
      <View style={[styles.decCircle, { width: 180, height: 180, bottom: 120, left: -50, opacity: 0.08 }]} />

      <View style={styles.center}>
        <Animated.View style={[styles.ripple, rippleStyle]} />
        <Animated.View style={[styles.logoBox, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <Image source={require('@/assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
        </Animated.View>
      </View>

      <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
        <Text style={styles.brand}>Homezy</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PARTNER</Text>
        </View>
        <Animated.Text style={[styles.tagline, { transform: [{ translateY: tagY }] }]}>
          Earn more. Work smarter.
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.loader, { opacity: textOpacity }]}>
        <View style={styles.loaderTrack}>
          <View style={styles.loaderFill} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  decCircle: { position: 'absolute', borderRadius: 999, backgroundColor: '#FFFFFF' },
  center: { alignItems: 'center', marginBottom: 24 },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  logoImg: { width: '100%', height: '100%' },
  textWrap: { alignItems: 'center' },
  brand: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2, marginBottom: 8 },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  proBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '400' },
  loader: { position: 'absolute', bottom: 60, alignItems: 'center' },
  loaderTrack: { width: 48, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  loaderFill: { width: '70%', height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
});

