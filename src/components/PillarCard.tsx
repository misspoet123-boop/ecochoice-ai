import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { PillarDetail } from '../types';
import { COLORS, getTrafficBadgeInfo } from '../theme/colors';

interface PillarCardProps {
  icon: React.ReactNode;
  pillar: PillarDetail;
  isPriority: boolean;
}

export const PillarCard: React.FC<PillarCardProps> = ({
  icon,
  pillar,
  isPriority,
}) => {
  const badge = getTrafficBadgeInfo(pillar.score);

  return (
    <View
      style={[
        styles.cardContainer,
        isPriority && styles.priorityBorder,
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={styles.titleTextGroup}>
            <Text style={styles.titleText}>{pillar.title}</Text>
            {isPriority && (
              <View style={styles.priorityBadge}>
                <Check size={10} color={COLORS.emerald[700]} strokeWidth={2.5} />
                <Text style={styles.priorityBadgeText}>Your Priority</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Metric & Detail Body */}
      <View style={styles.bodyBox}>
        <Text style={styles.metricText}>{pillar.metric}</Text>
        <Text style={styles.detailText}>{pillar.detail}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 13,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityBorder: {
    borderColor: COLORS.emerald[300],
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextGroup: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slate[900],
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald[700],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bodyBox: {
    backgroundColor: COLORS.slate[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
    padding: 10,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[900],
    marginBottom: 2,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.slate[600],
    lineHeight: 16,
  },
});
