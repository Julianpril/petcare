import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PeriodType, Plan } from './types';

interface PlanCardProps {
  plan: Plan;
  selectedPeriod: PeriodType;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, selectedPeriod, onSelect }: PlanCardProps) {
  return (
    <View style={[styles.card, plan.popular && styles.popularCard]}>
      {plan.badge && (
        <View style={styles.badgeContainer}>
          <LinearGradient colors={plan.color as any} style={styles.badge}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </LinearGradient>
        </View>
      )}

      <LinearGradient colors={plan.color as any} style={styles.header}>
        <Text style={styles.name}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          {plan.price === 0 ? (
            <Text style={styles.priceText}>Gratis</Text>
          ) : (
            <>
              <Text style={styles.currencySymbol}>$</Text>
              <Text style={styles.priceText}>{plan.price.toLocaleString('es-CO')}</Text>
            </>
          )}
        </View>
        <Text style={styles.periodText}>por {plan.period}</Text>
        {selectedPeriod === 'yearly' && plan.price > 0 && (
          <Text style={styles.savingsText}>
            Ahorra ${(plan.price * 0.17).toLocaleString('es-CO')}
          </Text>
        )}
      </LinearGradient>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name={feature.icon as any}
              size={20}
              color={feature.included ? '#10b981' : '#64748b'}
            />
            <Text
              style={[styles.featureText, !feature.included && styles.featureTextDisabled]}
            >
              {feature.text}
            </Text>
            {feature.included ? (
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#64748b" />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => onSelect(plan)}
        activeOpacity={0.8}
      >
        <LinearGradient colors={plan.color as any} style={styles.selectButtonGradient}>
          <Text style={styles.selectButtonText}>
            {plan.price === 0 ? 'Plan Actual' : 'Seleccionar Plan'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  popularCard: {
    borderColor: '#f093fb',
    borderWidth: 2,
    elevation: 8,
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  priceText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 56,
  },
  periodText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 4,
  },
  featuresContainer: {
    padding: 24,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  featureTextDisabled: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  selectButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
