import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  X,
  Search,
  Camera,
  Leaf,
  RefreshCw,
  Sliders,
  Sparkles,
  Bookmark,
} from 'lucide-react-native';
import { COLORS, SHADOWS, getTrafficBadgeInfo } from '../theme/colors';
import { TabType, Product } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/mockProducts';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenScanner: () => void;
  onOpenPro: () => void;
  activePreferencesCount: number;
  bookmarkedIds: string[];
  onSelectProduct: (productId: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  visible,
  onClose,
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenPro,
  activePreferencesCount,
  bookmarkedIds,
  onSelectProduct,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Drawer container on the LEFT side of the screen */}
        <View style={styles.drawerContainer}>
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoGroup}>
              <View style={styles.logoIconBox}>
                <Leaf size={16} color={COLORS.white} strokeWidth={2.4} />
              </View>
              <Text style={styles.drawerBrandText}>EcoLens</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeDrawerButton}
              activeOpacity={0.7}
              accessibilityLabel="Close navigation drawer"
            >
              <X size={18} color={COLORS.slate[600]} />
            </TouchableOpacity>
          </View>

          {/* Drawer Scrollable Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Navigation Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Quick Navigation</Text>

              {/* Home */}
              <TouchableOpacity
                onPress={() => {
                  onSelectTab('home');
                  onClose();
                }}
                style={[
                  styles.navItem,
                  activeTab === 'home' && styles.activeNavItem,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.navIconBox}>
                  <Search size={16} color={COLORS.emerald[700]} />
                </View>
                <Text style={styles.navLabel}>Home &amp; Product Catalog</Text>
              </TouchableOpacity>

              {/* Scanner */}
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenScanner();
                }}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <View style={styles.navIconBox}>
                  <Camera size={16} color={COLORS.emerald[700]} />
                </View>
                <Text style={styles.navLabel}>Product Photo Scanner</Text>
              </TouchableOpacity>

              {/* Audit */}
              <TouchableOpacity
                onPress={() => {
                  onSelectTab('audit');
                  onClose();
                }}
                style={[
                  styles.navItem,
                  activeTab === 'audit' && styles.activeNavItem,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.navIconBox}>
                  <Leaf size={16} color={COLORS.emerald[700]} />
                </View>
                <Text style={styles.navLabel}>Product Audit Breakdown</Text>
              </TouchableOpacity>

              {/* Swaps */}
              <TouchableOpacity
                onPress={() => {
                  onSelectTab('swaps');
                  onClose();
                }}
                style={[
                  styles.navItem,
                  activeTab === 'swaps' && styles.activeNavItem,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.navIconBox}>
                  <RefreshCw size={16} color={COLORS.emerald[700]} />
                </View>
                <Text style={styles.navLabel}>Cleaner Green Swaps</Text>
              </TouchableOpacity>

              {/* Preferences */}
              <TouchableOpacity
                onPress={() => {
                  onSelectTab('prefs');
                  onClose();
                }}
                style={[
                  styles.navItem,
                  activeTab === 'prefs' && styles.activePinkNavItem,
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.navIconBox, { backgroundColor: COLORS.pink[100] }]}>
                  <Sliders size={16} color={COLORS.pink[600]} />
                </View>
                <Text style={styles.navLabel}>Sustainability Priorities</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{activePreferencesCount}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Category Quick Filter Jump */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Filter Category</Text>
              <View style={styles.categoryPillsWrap}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      onSelectCategory(cat);
                      onSelectTab('home');
                      onClose();
                    }}
                    style={[
                      styles.categoryPill,
                      selectedCategory === cat && styles.activeCategoryPill,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        selectedCategory === cat && styles.activeCategoryPillText,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Saved Watchlist */}
            <View style={styles.sectionContainer}>
              <View style={styles.watchlistHeaderRow}>
                <Text style={styles.sectionHeader}>Saved Watchlist</Text>
                <View style={styles.watchlistCountTag}>
                  <Text style={styles.watchlistCountText}>
                    {bookmarkedIds.length} items
                  </Text>
                </View>
              </View>

              {bookmarkedIds.length === 0 ? (
                <Text style={styles.emptyWatchlistText}>No bookmarked items yet</Text>
              ) : (
                bookmarkedIds.map((bId) => {
                  const item = INITIAL_PRODUCTS.find((p) => p.id === bId);
                  if (!item) return null;
                  const badge = getTrafficBadgeInfo(item.trafficLight);
                  return (
                    <TouchableOpacity
                      key={bId}
                      onPress={() => {
                        onSelectProduct(bId);
                        onClose();
                      }}
                      style={styles.watchlistItem}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.watchlistItemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={[styles.watchlistDot, { backgroundColor: badge.dot }]} />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>

          {/* Drawer Footer Pro Banner */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenPro();
              }}
              style={styles.upgradeProButton}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color={COLORS.white} />
              <Text style={styles.upgradeProText}>Upgrade to EcoLens Pro (₹199)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backdrop on the RIGHT to dismiss */}
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerContainer: {
    width: 290,
    backgroundColor: COLORS.white,
    height: '100%',
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 12,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backdropTouch: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.pink[100],
    backgroundColor: COLORS.pink[50],
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  closeDrawerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 3,
  },
  activeNavItem: {
    backgroundColor: COLORS.emerald[50],
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  activePinkNavItem: {
    backgroundColor: COLORS.pink[50],
    borderWidth: 1,
    borderColor: COLORS.pink[200],
  },
  navIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.emerald[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[800],
  },
  countBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.pink[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  categoryPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 2,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  activeCategoryPill: {
    backgroundColor: COLORS.emerald[100],
    borderColor: COLORS.emerald[300],
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate[600],
  },
  activeCategoryPillText: {
    color: COLORS.emerald[900],
    fontWeight: '700',
  },
  watchlistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  watchlistCountTag: {
    backgroundColor: COLORS.emerald[50],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  watchlistCountText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  emptyWatchlistText: {
    fontSize: 11,
    color: COLORS.slate[400],
    paddingHorizontal: 6,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[100],
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 5,
  },
  watchlistItemName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.slate[800],
    flex: 1,
    marginRight: 6,
  },
  watchlistDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  drawerFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.pink[100],
    backgroundColor: COLORS.pink[50],
  },
  upgradeProButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pink[600],
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: COLORS.pink[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeProText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.white,
  },
});
