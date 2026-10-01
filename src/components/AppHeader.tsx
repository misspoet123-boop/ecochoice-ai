import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  Menu,
  Leaf,
  Sparkles,
  Sliders,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { UserPreferences } from '../types';

interface AppHeaderProps {
  preferences: UserPreferences;
  onOpenDrawer: () => void;
  onOpenPro: () => void;
  onToggleProfile: () => void;
  onGoHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  preferences,
  onOpenDrawer,
  onOpenPro,
  onToggleProfile,
  onGoHome,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollDirection, setScrollDirection] = useState<'right' | 'left'>('right');
  const [currentScrollX, setCurrentScrollX] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollX = contentOffset.x;
    setCurrentScrollX(scrollX);
    if (scrollX + layoutMeasurement.width >= contentSize.width - 12) {
      setScrollDirection('left');
    } else if (scrollX <= 12) {
      setScrollDirection('right');
    }
  };

  const handleToggleScroll = () => {
    if (scrollDirection === 'right') {
      scrollViewRef.current?.scrollTo({ x: currentScrollX + 160, animated: true });
    } else {
      scrollViewRef.current?.scrollTo({ x: Math.max(0, currentScrollX - 160), animated: true });
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Top Main Navigation Row */}
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          {/* Hamburger Drawer Button */}
          <TouchableOpacity
            onPress={onOpenDrawer}
            style={styles.menuButton}
            activeOpacity={0.7}
            accessibilityLabel="Open navigation menu"
          >
            <Menu size={20} color={COLORS.slate[700]} />
          </TouchableOpacity>

          {/* EcoLens Logo Button */}
          <TouchableOpacity
            onPress={onGoHome}
            style={styles.logoButton}
            activeOpacity={0.8}
          >
            <View style={styles.logoIconContainer}>
              <Leaf size={16} color={COLORS.white} strokeWidth={2.4} />
            </View>
            <Text style={styles.brandTitle}>EcoLens</Text>
          </TouchableOpacity>
        </View>

        {/* Right Action Controls */}
        <View style={styles.rightGroup}>
          <TouchableOpacity
            onPress={onOpenPro}
            style={styles.proBadgeButton}
            activeOpacity={0.8}
          >
            <Sparkles size={13} color={COLORS.pink[600]} />
            <Text style={styles.proBadgeText}>Pro</Text>
          </TouchableOpacity>

          {/* User Profile Avatar with toggle back to previous screen */}
          <TouchableOpacity
            onPress={onToggleProfile}
            style={styles.avatarButton}
            activeOpacity={0.8}
            accessibilityLabel="Toggle User Profile & Preferences"
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
              }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Eco Priorities Sub-Bar */}
      <View style={styles.prioritiesBar}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.prioritiesScrollContent}
        >
          <View style={styles.prioritiesPrefix}>
            <Sliders size={12} color={COLORS.pink[600]} />
            <Text style={styles.prioritiesLabel}>Priorities:</Text>
          </View>

          {preferences.zeroPlastic && (
            <View style={styles.priorityChip}>
              <Text style={styles.priorityChipText}>Zero Plastic</Text>
            </View>
          )}

          {preferences.carbonFootprint && (
            <View style={styles.priorityChip}>
              <Text style={styles.priorityChipText}>Low Carbon</Text>
            </View>
          )}

          {preferences.localSourcing && (
            <View style={styles.priorityChip}>
              <Text style={styles.priorityChipText}>Made in India</Text>
            </View>
          )}

          {preferences.ethicalSourcing && (
            <View style={styles.priorityChip}>
              <Text style={styles.priorityChipText}>Ethical</Text>
            </View>
          )}

          {preferences.veganCrueltyFree && (
            <View style={styles.priorityChip}>
              <Text style={styles.priorityChipText}>Cruelty Free</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onToggleProfile}
            style={styles.modifyButton}
            activeOpacity={0.7}
          >
            <Text style={styles.modifyButtonText}>Modify</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          onPress={handleToggleScroll}
          style={styles.scrollArrowButton}
          activeOpacity={0.7}
        >
          {scrollDirection === 'right' ? (
            <ChevronRight size={14} color={COLORS.pink[600]} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={14} color={COLORS.pink[600]} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
    zIndex: 30,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.slate[100],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emerald[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.emerald[700],
    letterSpacing: -0.5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.pink[50],
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.pink[700],
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: COLORS.pink[400],
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  prioritiesBar: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  prioritiesScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 6,
  },
  prioritiesPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prioritiesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate[500],
  },
  priorityChip: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    backgroundColor: COLORS.pink[50],
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    borderRadius: 6,
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.pink[700],
  },
  modifyButton: {
    paddingLeft: 4,
    paddingVertical: 2,
  },
  modifyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.pink[600],
  },
  scrollArrowButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
