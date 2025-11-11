import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { FAQSection } from './planes/FAQSection';
import { PeriodToggle } from './planes/PeriodToggle';
import { PlanCard } from './planes/PlanCard';
import { PlansHeader } from './planes/PlansHeader';
import type { Plan, PeriodType } from './planes/types';
import { getPlans } from './planes/types';

export default function PlanesScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');

  const plans = getPlans(selectedPeriod);

  const handleSelectPlan = (plan: Plan) => {
    Alert.alert(
      'Próximamente',
      `El plan ${plan.name} estará disponible muy pronto. ¡Gracias por tu interés!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <PlansHeader onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PeriodToggle selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selectedPeriod={selectedPeriod}
              onSelect={handleSelectPlan}
            />
          ))}
        </View>

        <FAQSection />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  plansContainer: {
    gap: 20,
  },
});
