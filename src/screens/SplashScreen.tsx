import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>IShare</Text>
      <Text style={styles.tagline}>Ride together, save together</Text>
      <ActivityIndicator 
        size="large" 
        color={COLORS.primary} 
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  appName: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: 8,
    fontSize: 36,
  },
  tagline: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen; 