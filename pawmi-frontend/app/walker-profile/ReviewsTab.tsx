import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SERVICE_ICONS, SERVICE_LABELS, type Review } from './types';

type ReviewsTabProps = {
  reviews: Review[];
};

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Ionicons
        key={i}
        name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
        size={16}
        color="#fbbf24"
      />
    );
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Ionicons name="person" size={20} color="#667eea" />
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewerName}>{review.reviewer.full_name}</Text>
          <View style={styles.reviewMeta}>
            {renderStars(review.rating)}
            <Text style={styles.reviewDate}>
              • {new Date(review.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
      <View style={styles.reviewService}>
        <Ionicons
          name={(SERVICE_ICONS[review.service_type] as any) || 'paw'}
          size={14}
          color="#667eea"
        />
        <Text style={styles.reviewServiceText}>
          {SERVICE_LABELS[review.service_type] || review.service_type}
        </Text>
      </View>
    </View>
  );
}

export function ReviewsTab({ reviews }: ReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <View style={styles.content}>
        <View style={styles.emptyReviews}>
          <Ionicons name="star-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyReviewsText}>Aún no hay reseñas</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyReviewsText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  reviewCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    color: '#94a3b8',
    fontSize: 13,
  },
  reviewComment: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewService: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewServiceText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
