import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PriceSummaryProps {
  hourlyRate: number;
  duration: number;
  total: number;
}

export function PriceSummary({ hourlyRate, duration, total }: PriceSummaryProps) {
  return (
    <View style={styles.priceSection}>
      <Text style={styles.priceSectionTitle}>Resumen</Text>

      <View style={styles.priceRow}>
        <Text style={styles.priceRowLabel}>Tarifa por hora</Text>
        <Text style={styles.priceRowValue}>${hourlyRate.toLocaleString('es-CO')}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceRowLabel}>Duración</Text>
        <Text style={styles.priceRowValue}>{duration}h</Text>
      </View>

      <View style={styles.priceDivider} />

      <View style={styles.priceRow}>
        <Text style={styles.priceTotalLabel}>Total</Text>
        <Text style={styles.priceTotalValue}>${total.toLocaleString('es-CO')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceSection: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  priceSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRowLabel: {
    color: '#94a3b8',
    fontSize: 15,
  },
  priceRowValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#2a3142',
    marginVertical: 12,
  },
  priceTotalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceTotalValue: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
