import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Sliders, Crown, RotateCcw } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { UserPreferences } from '../types';
import { PreferenceToggleRow } from '../components/PreferenceToggleRow';

interface PreferencesScreenProps {
  preferences: UserPreferences;
  onTogglePreference: (key: keyof UserPreferences) => void;
  onResetPreferences: () => void;
  onOpenPro: () => void;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({
  preferences,
  onTogglePreference,
  onResetPreferences,
  onOpenPro,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Intro Header Box */}
      <View style={styles.introCard}>
        <View style={styles.introTitleRow}>
          <Sliders size={18} color={COLORS.emerald[700]} />
          <Text style={styles.introTitle}>Your Eco Priorities</Text>
        </View>
        <Text style={styles.introSubtitle}>
          Pick what matters most to you. We adjust product scores and summaries to match your choices.
        </Text>
      </View>

      {/* Freemium Tier Indicator Banner */}
      <View style={styles.tierBanner}>
        <View style={styles.tierTopRow}>
          <View style={styles.crownBox}>
            <Crown size={18} color={COLORS.white} />
          </View>
          <View style={styles.tierInfo}>
            <View style={styles.tierStatusRow}>
              <Text style={styles.tierTitle}>Free Plan</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            </View>
            <Text style={styles.tierDescription}>
              Includes unlimited product photo scans, eco ratings, and greener swap suggestions.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onOpenPro}
          style={styles.upgradeBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.upgradeBtnText}>Upgrade to EcoLens Pro (₹199/mo)</Text>
        </TouchableOpacity>
      </View>

      {/* 5 Core Preference Toggles */}
      <View style={styles.toggleListCard}>
        <PreferenceToggleRow
          id="pref-carbon"
          title="1. Low Carbon Pollution"
          description="Prefers products made with solar or clean energy and local transport instead of heavy shipping."
          enabled={preferences.carbonFootprint}
          onToggle={() => onTogglePreference('carbonFootprint')}
        />

        <PreferenceToggleRow
          id="pref-zero-plastic"
          title="2. Plastic-Free Packaging"
          description="Flags hard-to-recycle plastic pouches and bottles. Rewards glass, metal tins, and paper."
          enabled={preferences.zeroPlastic}
          onToggle={() => onTogglePreference('zeroPlastic')}
        />

        <PreferenceToggleRow
          id="pref-vegan"
          title="3. 100% Vegan & Cruelty-Free"
          description="Highlights plant-based products with no dairy or animal ingredients and zero animal testing."
          enabled={preferences.veganCrueltyFree}
          onToggle={() => onTogglePreference('veganCrueltyFree')}
        />

        <PreferenceToggleRow
          id="pref-ethical"
          title="4. Fair Pay for Workers"
          description="Supports brands that pay fair wages to Indian farmers, tea workers, and village weavers."
          enabled={preferences.ethicalSourcing}
          onToggle={() => onTogglePreference('ethicalSourcing')}
        />

        <PreferenceToggleRow
          id="pref-local"
          title="5. Made in India"
          description="Prefers locally grown and made Indian products over imported ingredients."
          enabled={preferences.localSourcing}
          onToggle={() => onTogglePreference('localSourcing')}
        />
      </View>

      {/* Reset Defaults Action */}
      <View style={styles.footerRow}>
        <Text style={styles.savedText}>Saved automatically</Text>
        <TouchableOpacity
          onPress={onResetPreferences}
          style={styles.resetButton}
          activeOpacity={0.7}
        >
          <RotateCcw size={13} color={COLORS.emerald[700]} />
          <Text style={styles.resetButtonText}>Reset Defaults</Text>
        </TouchableOpacity>
      </View>
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
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 15,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  introTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  introSubtitle: {
    fontSize: 12,
    color: COLORS.slate[600],
    lineHeight: 16.5,
  },
  tierBanner: {
    backgroundColor: COLORS.amber[50],
    borderWidth: 1.5,
    borderColor: COLORS.amber[300],
    borderRadius: 22,
    padding: 15,
    marginBottom: 12,
    gap: 12,
    ...SHADOWS.card,
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  crownBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tierInfo: {
    flex: 1,
  },
  tierStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  activePill: {
    backgroundColor: COLORS.amber[200],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.amber[300],
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.amber[900],
  },
  tierDescription: {
    fontSize: 11.5,
    color: COLORS.slate[600],
    lineHeight: 15.5,
  },
  upgradeBtn: {
    backgroundColor: COLORS.amber[600],
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
    shadowColor: COLORS.amber[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  toggleListCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    overflow: 'hidden',
    marginBottom: 12,
    ...SHADOWS.card,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  savedText: {
    fontSize: 11.5,
    color: COLORS.slate[500],
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
});
