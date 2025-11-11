import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function InfoBanner() {
  return (
    <View style={styles.infoBanner}>
      <LinearGradient colors={['#10b981', '#059669']} style={styles.infoBannerGradient}>
        <Ionicons name="information-circle" size={32} color="#fff" />
        <View style={styles.infoBannerContent}>
          <Text style={styles.infoBannerTitle}>Gana más con menos comisión</Text>
          <Text style={styles.infoBannerText}>
            Mejores planes = menores comisiones + más herramientas para crecer
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBanner: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  infoBannerContent: {
    flex: 1,
    gap: 4,
  },
  infoBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoBannerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});
