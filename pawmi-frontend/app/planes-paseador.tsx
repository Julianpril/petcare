import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ComparisonSection } from './planes-paseador/ComparisonSection';
import { FAQSection } from './planes-paseador/FAQSection';
import { InfoBanner } from './planes-paseador/InfoBanner';
import { PeriodToggle } from './planes-paseador/PeriodToggle';
import { PlanCard } from './planes-paseador/PlanCard';
import { PlansHeader } from './planes-paseador/PlansHeader';
import type { PeriodType, PlanPaseador } from './planes-paseador/types';

export default function PlanesPaseador() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');

  const plans: PlanPaseador[] = [
    {
      id: 'basico',
      name: 'Básico',
      commission: 20,
      monthlyFee: 0,
      period: selectedPeriod === 'monthly' ? 'mes' : 'año',
      color: ['#667eea', '#764ba2'],
      features: [
        { icon: 'calendar', text: 'Gestión de reservas básica', included: true },
        { icon: 'person', text: 'Perfil de paseador', included: true },
        { icon: 'star', text: 'Sistema de reseñas', included: true },
        { icon: 'notifications', text: 'Notificaciones push', included: true },
        { icon: 'chatbubbles', text: 'Chat con clientes', included: true },
        { icon: 'wallet', text: 'Pagos seguros', included: true },
        { icon: 'stats-chart', text: 'Estadísticas básicas', included: true },
        { icon: 'shield-checkmark', text: 'Verificación premium', included: false },
        { icon: 'megaphone', text: 'Promoción destacada', included: false },
        { icon: 'analytics', text: 'Analíticas avanzadas', included: false },
        { icon: 'headset', text: 'Soporte prioritario', included: false },
        { icon: 'images', text: 'Galería ilimitada', included: false },
      ],
    },
    {
      id: 'profesional',
      name: 'Profesional',
      commission: 15,
      monthlyFee: selectedPeriod === 'monthly' ? 29900 : 299000,
      period: selectedPeriod === 'monthly' ? 'mes' : 'año',
      color: ['#f093fb', '#f5576c'],
      popular: true,
      badge: 'Más Popular',
      features: [
        { icon: 'calendar', text: 'Gestión de reservas avanzada', included: true },
        { icon: 'person', text: 'Perfil de paseador premium', included: true },
        { icon: 'star', text: 'Sistema de reseñas + respuestas', included: true },
        { icon: 'notifications', text: 'Notificaciones push ilimitadas', included: true },
        { icon: 'chatbubbles', text: 'Chat prioritario', included: true },
        { icon: 'wallet', text: 'Pagos seguros + anticipos', included: true },
        { icon: 'stats-chart', text: 'Estadísticas detalladas', included: true },
        { icon: 'shield-checkmark', text: 'Verificación premium', included: true },
        { icon: 'megaphone', text: 'Promoción destacada 2x', included: true },
        { icon: 'analytics', text: 'Analíticas avanzadas', included: true },
        { icon: 'headset', text: 'Soporte prioritario 24/7', included: true },
        { icon: 'images', text: 'Galería ilimitada + 4K', included: true },
      ],
    },
    {
      id: 'empresarial',
      name: 'Empresarial',
      commission: 10,
      monthlyFee: selectedPeriod === 'monthly' ? 79900 : 799000,
      period: selectedPeriod === 'monthly' ? 'mes' : 'año',
      color: ['#4facfe', '#00f2fe'],
      badge: 'Para Empresas',
      features: [
        { icon: 'calendar', text: 'Gestión multi-paseador', included: true },
        { icon: 'person', text: 'Perfiles empresariales', included: true },
        { icon: 'star', text: 'Reseñas + verificación empresa', included: true },
        { icon: 'notifications', text: 'Notificaciones personalizadas', included: true },
        { icon: 'chatbubbles', text: 'Chat empresarial + CRM', included: true },
        { icon: 'wallet', text: 'Pagos corporativos', included: true },
        { icon: 'stats-chart', text: 'Dashboard empresarial', included: true },
        { icon: 'shield-checkmark', text: 'Verificación empresarial', included: true },
        { icon: 'megaphone', text: 'Promoción destacada ilimitada', included: true },
        { icon: 'analytics', text: 'Analíticas empresariales + BI', included: true },
        { icon: 'headset', text: 'Soporte dedicado + gerente de cuenta', included: true },
        { icon: 'images', text: 'Galería ilimitada + marca', included: true },
      ],
    },
  ];

  const handleSelectPlan = (plan: PlanPaseador) => {
    Alert.alert(
      'Próximamente',
      `La funcionalidad para seleccionar el plan ${plan.name} estará disponible pronto.`,
      [{ text: 'Entendido' }]
    );
  };

  return (
    <View style={styles.container}>
      <PlansHeader onBack={() => router.back()} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <InfoBanner />
          <PeriodToggle selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

          <View style={styles.plansGrid}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
            ))}
          </View>

          <ComparisonSection />
          <FAQSection />

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  plansGrid: {
    gap: 24,
  },
  bottomPadding: {
    height: 40,
  },
});
