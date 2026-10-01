import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../theme/colors';

interface PreferenceToggleRowProps {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export const PreferenceToggleRow: React.FC<PreferenceToggleRowProps> = ({
  title,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>

      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{
          false: COLORS.slate[300],
          true: COLORS.emerald[600],
        }}
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.slate[300]}
        style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] } : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slate[900],
    marginBottom: 3,
  },
  descriptionText: {
    fontSize: 11,
    color: COLORS.slate[600],
    lineHeight: 16,
  },
});
