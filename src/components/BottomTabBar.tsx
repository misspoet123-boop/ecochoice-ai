import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Leaf, Camera, RefreshCw, Sliders } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { TabType } from '../types';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLaunchScanner: () => void;
  activePreferencesCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  onLaunchScanner,
  activePreferencesCount,
}) => {
  return (
    <View style={styles.tabBarContainer}>
      {/* Tab 1: Home */}
      <TouchableOpacity
        onPress={() => onTabChange('home')}
        style={[styles.tabButton, activeTab === 'home' && styles.activeTabButton]}
        activeOpacity={0.7}
        accessibilityLabel="Home and product search"
      >
        <Search
          size={18}
          color={activeTab === 'home' ? COLORS.emerald[700] : COLORS.slate[400]}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'home' ? styles.activeTabLabelEmerald : styles.inactiveTabLabel,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Audit */}
      <TouchableOpacity
        onPress={() => onTabChange('audit')}
        style={[styles.tabButton, activeTab === 'audit' && styles.activeTabButton]}
        activeOpacity={0.7}
        accessibilityLabel="Sustainability audit breakdown"
      >
        <Leaf
          size={18}
          color={activeTab === 'audit' ? COLORS.emerald[700] : COLORS.slate[400]}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'audit' ? styles.activeTabLabelEmerald : styles.inactiveTabLabel,
          ]}
        >
          Audit
        </Text>
      </TouchableOpacity>

      {/* Tab 3: Center Camera Photo Scan FAB */}
      <View style={styles.centerFabWrapper}>
        <TouchableOpacity
          onPress={onLaunchScanner}
          style={styles.centerFabButton}
          activeOpacity={0.85}
          accessibilityLabel="Launch product camera scan"
        >
          <Camera size={22} color={COLORS.white} strokeWidth={2.3} />
        </TouchableOpacity>
        <Text style={styles.centerFabLabel}>Scan</Text>
      </View>

      {/* Tab 4: Swaps */}
      <TouchableOpacity
        onPress={() => onTabChange('swaps')}
        style={[styles.tabButton, activeTab === 'swaps' && styles.activeTabButton]}
        activeOpacity={0.7}
        accessibilityLabel="Greener alternatives and swaps"
      >
        <RefreshCw
          size={18}
          color={activeTab === 'swaps' ? COLORS.emerald[700] : COLORS.slate[400]}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'swaps' ? styles.activeTabLabelEmerald : styles.inactiveTabLabel,
          ]}
        >
          Swaps
        </Text>
      </TouchableOpacity>

      {/* Tab 5: Prefs */}
      <TouchableOpacity
        onPress={() => onTabChange('prefs')}
        style={[styles.tabButton, activeTab === 'prefs' && styles.activePinkTabButton]}
        activeOpacity={0.7}
        accessibilityLabel="User sustainability preferences"
      >
        <View style={styles.prefsIconContainer}>
          <Sliders
            size={18}
            color={activeTab === 'prefs' ? COLORS.pink[600] : COLORS.slate[400]}
          />
          {activePreferencesCount > 0 && (
            <View style={styles.prefsBadgeDot} />
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'prefs' ? styles.activeTabLabelPink : styles.inactiveTabLabel,
          ]}
        >
          Prefs
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200],
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 40,
    minHeight: 62,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 46,
  },
  activeTabButton: {
    backgroundColor: COLORS.emerald[50],
  },
  activePinkTabButton: {
    backgroundColor: COLORS.pink[50],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  inactiveTabLabel: {
    color: COLORS.slate[400],
  },
  activeTabLabelEmerald: {
    color: COLORS.emerald[800],
    fontWeight: '700',
  },
  activeTabLabelPink: {
    color: COLORS.pink[700],
    fontWeight: '700',
  },
  centerFabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerFabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  centerFabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald[700],
    marginTop: 2,
    letterSpacing: -0.2,
  },
  prefsIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefsBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.pink[500],
    borderWidth: 1,
    borderColor: COLORS.white,
  },
});
