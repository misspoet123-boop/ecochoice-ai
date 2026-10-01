import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { Award, ArrowRight, Check, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS, getTrafficBadgeInfo } from '../theme/colors';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

interface SwapsScreenProps {
  currentProduct: Product;
  onSelectProduct: (productId: string) => void;
  onGoHome: () => void;
}

export const SwapsScreen: React.FC<SwapsScreenProps> = ({
  currentProduct,
  onSelectProduct,
  onGoHome,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <View style={styles.bannerTagRow}>
          <Sparkles size={13} color={COLORS.emerald[300]} />
          <Text style={styles.bannerTag}>Better Eco Choices</Text>
        </View>
        <Text style={styles.bannerTitle}>Greener Swaps for You</Text>
        <Text style={styles.bannerSubtitle}>
          Everyday swaps with less plastic, lower carbon emissions, and fair pay for Indian farmers.
        </Text>

        <View style={styles.replacingBox}>
          <Text style={styles.replacingLabel}>Replacing:</Text>
          <Text style={styles.replacingName} numberOfLines={1}>
            {currentProduct.name}
          </Text>
        </View>
      </View>

      {/* Alternatives List */}
      {currentProduct.alternatives.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Award size={30} color={COLORS.emerald[700]} />
          </View>
          <Text style={styles.emptyTitle}>Already a Top Eco Choice!</Text>
          <Text style={styles.emptySubtitle}>
            {currentProduct.name} already has a top green rating for its eco-friendly packaging and local Indian sourcing.
          </Text>
          <TouchableOpacity
            onPress={onGoHome}
            style={styles.browseCatalogBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.browseCatalogBtnText}>Browse More Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.swapsList}>
          {currentProduct.alternatives.map((altId, rankIndex) => {
            const altProduct = INITIAL_PRODUCTS.find((p) => p.id === altId);
            if (!altProduct) return null;
            const badge = getTrafficBadgeInfo(altProduct.trafficLight);
            const customTags =
              currentProduct.alternativeTags?.[altId] || [
                'Zero Plastic',
                'Certified Organic',
              ];

            const impactSavings = Math.max(
              15,
              altProduct.overallScoreNum - currentProduct.overallScoreNum
            );

            return (
              <View key={altId} style={styles.swapCard}>
                {/* Swap Image with Rank Badge */}
                <View style={styles.imageBox}>
                  <Image
                    source={{ uri: altProduct.image }}
                    style={styles.swapImage}
                    resizeMode="cover"
                  />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>
                      #{rankIndex + 1} Best Swap
                    </Text>
                  </View>
                </View>

                {/* Swap Details */}
                <View style={styles.swapContent}>
                  <View style={styles.swapTopRow}>
                    <View style={styles.brandChip}>
                      <Text style={styles.brandChipText}>{altProduct.brand}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label} ({altProduct.overallScoreNum}/100)
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.swapTitle}>{altProduct.name}</Text>

                  {/* Feature comparison tags */}
                  <View style={styles.tagsRow}>
                    {customTags.map((tag, tIdx) => (
                      <View key={tIdx} style={styles.featureTag}>
                        <Check size={11} color={COLORS.emerald[700]} strokeWidth={2.5} />
                        <Text style={styles.featureTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.swapExplanation}>
                    {altProduct.baseAiExplanation}
                  </Text>

                  {/* Action Button */}
                  <View style={styles.actionWrapper}>
                    <TouchableOpacity
                      onPress={() => onSelectProduct(altId)}
                      style={styles.inspectBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.inspectBtnText}>View Full Details</Text>
                      <ArrowRight size={14} color={COLORS.white} strokeWidth={2.4} />
                    </TouchableOpacity>
                    <Text style={styles.savingsText}>
                      Cuts environmental impact by ~{impactSavings}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 26,
  },
  topBanner: {
    backgroundColor: COLORS.emerald[900],
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    ...SHADOWS.glow,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  bannerTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.emerald[300],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 11.5,
    color: COLORS.emerald[100],
    lineHeight: 16,
    marginBottom: 12,
  },
  replacingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    gap: 6,
  },
  replacingLabel: {
    fontSize: 11,
    color: COLORS.emerald[200],
    fontWeight: '600',
  },
  replacingName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 24,
    alignItems: 'center',
    gap: 9,
    ...SHADOWS.card,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.emerald[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.slate[600],
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  browseCatalogBtn: {
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 6,
    ...SHADOWS.glow,
  },
  browseCatalogBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  swapsList: {
    gap: 12,
  },
  swapCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.emerald[200],
    padding: 14,
    ...SHADOWS.card,
  },
  imageBox: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.slate[100],
    position: 'relative',
    marginBottom: 11,
  },
  swapImage: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.emerald[700],
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  swapContent: {
    gap: 8,
  },
  swapTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandChip: {
    backgroundColor: COLORS.emerald[50],
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  brandChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  swapTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.slate[900],
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.emerald[50],
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.emerald[900],
  },
  swapExplanation: {
    fontSize: 11.5,
    color: COLORS.slate[600],
    lineHeight: 16,
  },
  actionWrapper: {
    marginTop: 4,
    gap: 4,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald[600],
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    minHeight: 46,
    ...SHADOWS.glow,
  },
  inspectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  savingsText: {
    fontSize: 10.5,
    color: COLORS.slate[500],
    textAlign: 'center',
    fontWeight: '500',
  },
});
