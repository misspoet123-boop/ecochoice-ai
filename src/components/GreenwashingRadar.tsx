import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface GreenwashingRadarProps {
  alertText: string;
}

export const GreenwashingRadar: React.FC<GreenwashingRadarProps> = ({ alertText }) => {
  return (
    <View style={styles.alertCard}>
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <ShieldAlert size={20} color={COLORS.white} strokeWidth={2.2} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.alertTitle}>Greenwashing Alert</Text>
            <View style={styles.cautionBadge}>
              <Text style={styles.cautionText}>Buyer Caution</Text>
            </View>
          </View>
          <Text style={styles.alertDescription}>{alertText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: COLORS.rose[50],
    borderWidth: 1.5,
    borderColor: COLORS.rose[300],
    borderRadius: 18,
    padding: 13,
    marginBottom: 12,
    shadowColor: COLORS.rose[600],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.rose[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.rose[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cautionBadge: {
    backgroundColor: COLORS.rose[200],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.rose[300],
  },
  cautionText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.rose[900],
  },
  alertDescription: {
    fontSize: 11.5,
    color: COLORS.rose[900],
    lineHeight: 16,
  },
});
