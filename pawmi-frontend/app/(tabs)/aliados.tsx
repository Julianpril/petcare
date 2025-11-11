import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const alliedClinics = [
  {
    name: 'AsMeVet',
    rating: 4.4,
    category: 'Animal hospital',
    address: 'Cra 8 #12-8, Tunja, Boyacá',
    references: ['My Blog'],
    highlight: 'Ideal para: clínica con buen volumen de reseñas, ubicación céntrica, atención general.',
    tip: 'Tip: Verifica horario de urgencias para emergencias.',
    reviews: '900+ reseñas',
  },
  {
    name: 'Vet Medical',
    rating: 4.6,
    category: 'Veterinaria integral',
    address: 'Cl. 49a #531, Tunja, Boyacá',
    references: ['Veterinarias en Colombia'],
    highlight: 'Ideal para: servicios integrales (cirugía, hospitalización).',
    tip: 'Tip: Confirma disponibilidad de hospitalización para procedimientos mayores.',
    reviews: '120+ reseñas',
  },
  {
    name: 'Dogtor House',
    rating: 4.7,
    category: 'Cuidado especializado',
    address: 'Av. Colón #29-71, Tunja, Boyacá',
    references: ['Veterinarias en Colombia', 'MichiGatitos'],
    highlight: 'Ideal para: medicina interna y seguimiento de casos crónicos.',
    tip: 'Tip: Agenda con anticipación si necesitas una consulta especializada.',
    reviews: '200+ reseñas',
  },
  {
    name: 'CliniVet El Cebú',
    rating: 4.8,
    category: 'Veterinaria',
    address: 'Calle 19 #13-04, Tunja, Boyacá',
    references: ['MichiGatitos'],
    highlight: 'Ideal para: atención personalizada con alta valoración.',
    tip: 'Tip: Verifica horarios y si ofrecen atención de urgencia.',
    reviews: '80+ reseñas',
  },
  {
    name: 'Zoomedica',
    rating: 4.4,
    category: 'Urgencias Veterinarias',
    address: 'Tv. 11 #23-54, Parque Santander, Tunja, Boyacá',
    references: ['x.veterinaria24hs.com'],
    highlight: 'Ideal para: atención fuera de horario y casos urgentes.',
    tip: 'Tip: Llama antes para confirmar disponibilidad 24/7.',
    reviews: '170+ reseñas',
  },
  {
    name: 'Petcenter Tunja',
    rating: 3.9,
    category: 'Veterinaria',
    address: 'Av. Nte. #45-24, Tunja, Boyacá',
    references: ['My Blog', 'MichiGatitos'],
    highlight: 'Ideal para: cuidados básicos y tratamientos sencillos.',
    tip: 'Tip: Para casos complejos considera una clínica con valoración más alta.',
    reviews: '300+ reseñas',
  },
  {
    name: 'Los Potrillos Veterinaria Tunja',
    rating: 4.7,
    category: 'Veterinaria',
    address: 'Cra. 2b #9-55, Tunja, Boyacá',
    references: ['Veterinarias en Colombia'],
    highlight: 'Ideal para: atención integral, incluso animales de granja.',
    tip: 'Tip: Pregunta por servicios de hospitalización y cirugía.',
    reviews: '20+ reseñas',
  },
  {
    name: 'Mascotas Tunja Centro Especializado Veterinario',
    rating: 4.4,
    category: 'Veterinaria',
    address: 'Av. Universitaria, Cl. 58b #1a-04, Tunja, Boyacá',
    references: ['MichiGatitos'],
    highlight: 'Ideal para: consultas rutinarias, vacunación y control general.',
    tip: 'Tip: Para urgencias confirma disponibilidad inmediata.',
    reviews: '36+ reseñas',
  },
  {
    name: 'Trébol Veterinaria Tunja',
    rating: 4.9,
    category: 'Veterinaria',
    address: 'Cl. 46 #6-17, Tunja, Boyacá',
    references: ['Reseñas locales'],
    highlight: 'Ideal para: atención de alta calidad con excelente valoración.',
    tip: 'Tip: Confirma horarios y urgencias antes de tu visita.',
    reviews: '48 reseñas',
  },
  {
    name: 'Doc Dog Veterinaria',
    rating: 4.6,
    category: 'Veterinaria',
    address: 'Cra. 12 #15-53, Tunja, Boyacá',
    references: ['Directorio local'],
    highlight: 'Ideal para: atención veterinaria general con buena reputación.',
    tip: 'Tip: Si tu mascota es joven, encontrarás paquetes preventivos atractivos.',
    reviews: '78 reseñas',
  },
];

const couponDeals = [
  {
    title: '50% OFF Baño & Spa',
    partner: 'MichiGatitos Grooming',
    description: 'Incluye baño dermatológico, secado y masaje relajante para gatos.',
    code: 'PAWMI-SPA50',
    expires: 'Válido hasta 30/12/2025',
  },
  {
    title: '2x1 Consulta Preventiva',
    partner: 'Dogtor House',
    description: 'Agenda chequeo completo para dos mascotas y paga una sola consulta.',
    code: 'PAWMI-CHECK',
    expires: 'Válido hasta 15/01/2026',
  },
  {
    title: 'Vacuna al 30% OFF',
    partner: 'CliniVet El Cebú',
    description: 'Aplicación de refuerzo + carnet actualizado para perros y gatos.',
    code: 'PAWMI-VAX30',
    expires: 'Válido hasta 28/02/2026',
  },
  {
    title: 'Plan de nutrición personalizado',
    partner: 'Vet Medical',
    description: 'Evaluación nutricional + plan mensual con 20% de descuento.',
    code: 'PAWMI-NUTRI',
    expires: 'Válido hasta 31/03/2026',
  },
];

const AlliesScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ff9f43', '#ff6f61']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aliados y Cupones</Text>
        <Text style={styles.headerSubtitle}>Beneficios exclusivos para la comunidad Pawmi</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBubble}>
              <Ionicons name="medkit" size={18} color="#ff6f61" />
            </View>
            <Text style={styles.sectionTitle}>Nuestras veterinarias aliadas</Text>
          </View>

          {alliedClinics.map((clinic, index) => (
            <View key={clinic.name} style={styles.clinicCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#facc15" />
                  <Text style={styles.ratingText}>{clinic.rating.toFixed(1)}</Text>
                </View>
              </View>

              <Text style={styles.clinicCategory}>{clinic.category}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location" size={16} color="#94a3b8" />
                <Text style={styles.addressText}>{clinic.address}</Text>
              </View>

              <Text style={styles.reviewsText}>Valoración estimada: ~{clinic.rating.toFixed(1)}★ ({clinic.reviews})</Text>

              <View style={styles.referenceChips}>
                {clinic.references.map(reference => (
                  <View key={`${clinic.name}-${reference}`} style={styles.referenceChip}>
                    <Text style={styles.referenceText}>{reference}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.highlightText}>{clinic.highlight}</Text>
              <View style={styles.tipContainer}>
                <Ionicons name="bulb" size={16} color="#38bdf8" />
                <Text style={styles.tipText}>{clinic.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBubble, styles.sectionIconCoupon]}>
              <Ionicons name="gift" size={18} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Cupones aliados</Text>
          </View>

          {couponDeals.map(deal => (
            <LinearGradient
              key={deal.code}
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.couponCard}
            >
              <View style={styles.couponHeader}>
                <Text style={styles.couponTitle}>{deal.title}</Text>
                <View style={styles.couponPartnerBadge}>
                  <Ionicons name="business" size={14} color="#0f172a" />
                  <Text style={styles.couponPartnerText}>{deal.partner}</Text>
                </View>
              </View>

              <Text style={styles.couponDescription}>{deal.description}</Text>

              <View style={styles.couponFooter}>
                <View style={styles.couponCodeBubble}>
                  <Ionicons name="pricetag" size={14} color="#2563eb" />
                  <Text style={styles.couponCode}>{deal.code}</Text>
                </View>
                <Text style={styles.couponExpiry}>{deal.expires}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 6,
    color: '#fff',
    opacity: 0.85,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,111,97,0.15)',
    marginRight: 10,
  },
  sectionIconCoupon: {
    backgroundColor: '#ff6f61',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  clinicCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#293548',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,204,21,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#facc15',
    fontWeight: '600',
    marginLeft: 4,
  },
  clinicCategory: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    color: '#cbd5e1',
    marginLeft: 6,
    flex: 1,
  },
  reviewsText: {
    color: '#94a3b8',
    marginBottom: 12,
    fontSize: 13,
  },
  referenceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  referenceChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(79,172,254,0.15)',
  },
  referenceText: {
    color: '#4facfe',
    fontSize: 12,
    fontWeight: '600',
  },
  highlightText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  tipText: {
    color: '#bae6fd',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  couponCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  couponTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  couponPartnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  couponPartnerText: {
    color: '#0f172a',
    fontWeight: '600',
    marginLeft: 6,
  },
  couponDescription: {
    color: '#0f172a',
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  couponFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponCodeBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#bfdbfe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  couponCode: {
    color: '#1d4ed8',
    fontWeight: '700',
    marginLeft: 6,
  },
  couponExpiry: {
    color: 'rgba(15,23,42,0.65)',
    fontSize: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AlliesScreen;
