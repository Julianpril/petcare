import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ComparisonSection() {
  return (
    <View style={styles.comparisonSection}>
      <Text style={styles.comparisonTitle}>¿Cuánto ganarías?</Text>
      <Text style={styles.comparisonSubtitle}>
        Ejemplo con 50 reservas de $50,000 c/u ($2,500,000 en ventas)
      </Text>

      <View style={styles.comparisonCards}>
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonPlanName}>Básico</Text>
          <Text style={styles.comparisonCommission}>Comisión: 20%</Text>
          <View style={styles.comparisonEarnings}>
            <Text style={styles.comparisonLabel}>Ganas:</Text>
            <Text style={styles.comparisonValue}>$2,000,000</Text>
          </View>
        </View>

        <View style={[styles.comparisonCard, styles.comparisonCardHighlight]}>
          <Ionicons name="trophy" size={24} color="#fbbf24" style={styles.comparisonIcon} />
          <Text style={styles.comparisonPlanName}>Profesional</Text>
          <Text style={styles.comparisonCommission}>Comisión: 15%</Text>
          <View style={styles.comparisonEarnings}>
            <Text style={styles.comparisonLabel}>Ganas:</Text>
            <Text style={[styles.comparisonValue, styles.comparisonValueHighlight]}>$2,095,100</Text>
          </View>
          <Text style={styles.comparisonExtra}>+$95,100 más que Básico</Text>
        </View>

        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonPlanName}>Empresarial</Text>
          <Text style={styles.comparisonCommission}>Comisión: 10%</Text>
          <View style={styles.comparisonEarnings}>
            <Text style={styles.comparisonLabel}>Ganas:</Text>
            <Text style={styles.comparisonValue}>$2,170,100</Text>
          </View>
          <Text style={styles.comparisonExtra}>+$170,100 más que Básico</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comparisonSection: {
    marginTop: 40,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  comparisonSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  comparisonCards: {
    gap: 16,
  },
  comparisonCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  comparisonCardHighlight: {
    borderColor: '#fbbf24',
    borderWidth: 2,
    backgroundColor: '#1f2937',
  },
  comparisonIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  comparisonPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  comparisonCommission: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  comparisonEarnings: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  comparisonValueHighlight: {
    fontSize: 28,
    color: '#fbbf24',
  },
  comparisonExtra: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'right',
  },
});
