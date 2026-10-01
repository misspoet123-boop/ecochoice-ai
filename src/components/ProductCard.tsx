import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Product } from '../types';
import { COLORS, SHADOWS, getTrafficBadgeInfo } from '../theme/colors';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const badge = getTrafficBadgeInfo(product.trafficLight);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.cardContainer}
      activeOpacity={0.75}
      accessibilityLabel={`View details for ${product.name}`}
    >
      {/* 1. Category & Overall Score Row */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {product.category}
          </Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{product.overallScoreNum}/100</Text>
        </View>
      </View>

      {/* 2. Standardized Aspect Ratio Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* 3. Brand & Product Title */}
      <View style={styles.bodyContent}>
        <Text style={styles.brandText} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Traffic Light Status Badge */}
        <View style={[styles.trafficBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
          <Text style={[styles.trafficLabel, { color: badge.text }]} numberOfLines={1}>
            {badge.label}
          </Text>
        </View>

        {/* Card Footer: 3 Pillar Dots + Details Link */}
        <View style={styles.footerRow}>
          <View style={styles.pillarDotsGroup}>
            <View
              style={[
                styles.pillarDot,
                {
                  backgroundColor:
                    product.pillars.packaging.score === 'green'
                      ? COLORS.emerald[500]
                      : product.pillars.packaging.score === 'yellow'
                      ? COLORS.amber[400]
                      : COLORS.rose[500],
                },
              ]}
            />
            <View
              style={[
                styles.pillarDot,
                {
                  backgroundColor:
                    product.pillars.carbon.score === 'green'
                      ? COLORS.emerald[500]
                      : product.pillars.carbon.score === 'yellow'
                      ? COLORS.amber[400]
                      : COLORS.rose[500],
                },
              ]}
            />
            <View
              style={[
                styles.pillarDot,
                {
                  backgroundColor:
                    product.pillars.local.score === 'green'
                      ? COLORS.emerald[500]
                      : product.pillars.local.score === 'yellow'
                      ? COLORS.amber[400]
                      : COLORS.rose[500],
                },
              ]}
            />
          </View>

          <View style={styles.detailsLink}>
            <Text style={styles.detailsText}>Details</Text>
            <ArrowRight size={12} color={COLORS.emerald[700]} strokeWidth={2.4} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 12,
    marginBottom: 10,
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.emerald[50],
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 7,
    maxWidth: '65%',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  scorePill: {
    backgroundColor: COLORS.slate[100],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate[700],
  },
  imageContainer: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.slate[100],
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  bodyContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate[500],
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[900],
    lineHeight: 16,
    minHeight: 32,
    marginBottom: 6,
  },
  trafficBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4.5,
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trafficLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
  },
  pillarDotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
  },
  pillarDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald[700],
  },
});
