import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const SplashScreen = () => {
  // Animasyon değerleri Başlangıçta görünmez ve küçük
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opaklık (0 -> 1)
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Büyüklük (0.5 -> 1)
  const moveAnim = useRef(new Animated.Value(50)).current; // Aşağıdan yukarı gelme

  useEffect(() => {
    // Animasyonları aynı anda başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // 1 saniye sürsün
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5, // Yaylanma efekti
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim }, // Büyüme efekti
            { translateY: moveAnim } // Yukarı kayma efekti
          ], 
          alignItems: 'center'
        }}
      >
        {/* LOGO METNİ */}
        <Text style={styles.title}>
          KONYA
          <Text style={styles.vibe}>VIBE</Text>
        </Text>
        
        {/* Alt Slogan */}
        <Text style={styles.subtitle}>Şehrin Ritmini Yakala</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Koyu Arka Plan
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 50, // Kocaman yazı
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  vibe: {
    color: '#00f3ff', // NEON MAVİ
    textShadowColor: '#b026ff', // NEON MOR GÖLGE
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20, // Parlama şiddeti
  },
  subtitle: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
    letterSpacing: 1,
  }
});

export default SplashScreen;