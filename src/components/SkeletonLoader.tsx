import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';

interface SkeletonBlockProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Single animated skeleton shimmer block.
 * Uses a fade pulse animation between two gray tones.
 */
export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = 14,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: COLORS.slate[200],
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Pre-built skeleton shapes for common EcoLens UI patterns
// ─────────────────────────────────────────────────────────────────────────────

/** Skeleton for the three metric summary cards (Carbon / Packaging / Ethics) */
export const MetricCardSkeleton: React.FC = () => (
  <View style={skStyles.metricCard}>
    <View style={skStyles.metricHeaderRow}>
      <SkeletonBlock width={26} height={26} borderRadius={8} />
      <SkeletonBlock width={7} height={7} borderRadius={3.5} />
    </View>
    <SkeletonBlock width="60%" height={11} borderRadius={6} style={{ marginBottom: 5 }} />
    <SkeletonBlock width="90%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
    <SkeletonBlock width="75%" height={10} borderRadius={5} />
  </View>
);

/** Skeleton for the traffic-light score banner */
export const ScoreBannerSkeleton: React.FC = () => (
  <View style={skStyles.scoreBanner}>
    <SkeletonBlock width={120} height={28} borderRadius={14} />
    <SkeletonBlock width={70} height={36} borderRadius={12} />
  </View>
);

/** Skeleton for the AI analysis text block */
export const AnalysisTextSkeleton: React.FC = () => (
  <View style={skStyles.analysisBlock}>
    <SkeletonBlock width="100%" height={13} borderRadius={7} style={{ marginBottom: 7 }} />
    <SkeletonBlock width="95%" height={13} borderRadius={7} style={{ marginBottom: 7 }} />
    <SkeletonBlock width="88%" height={13} borderRadius={7} style={{ marginBottom: 7 }} />
    <SkeletonBlock width="70%" height={13} borderRadius={7} />
  </View>
);

/** Skeleton for the sources citation chips row */
export const SourcesChipsSkeleton: React.FC = () => (
  <View style={skStyles.sourcesRow}>
    <SkeletonBlock width={100} height={28} borderRadius={8} />
    <SkeletonBlock width={130} height={28} borderRadius={8} />
    <SkeletonBlock width={110} height={28} borderRadius={8} />
  </View>
);

/** Full metric grid skeleton (3 cards side by side) */
export const MetricsGridSkeleton: React.FC = () => (
  <View style={skStyles.metricsGrid}>
    <MetricCardSkeleton />
    <MetricCardSkeleton />
    <MetricCardSkeleton />
  </View>
);

const skStyles = StyleSheet.create({
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
    padding: 10,
    minHeight: 110,
    gap: 0,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.slate[200],
    backgroundColor: COLORS.slate[50],
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  analysisBlock: {
    gap: 0,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
});
