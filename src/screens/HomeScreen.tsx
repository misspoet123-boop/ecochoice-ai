import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  Globe,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, SHADOWS, getTrafficBadgeInfo } from '../theme/colors';
import { Product } from '../types';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/mockProducts';
import { ProductCard } from '../components/ProductCard';

interface HomeScreenProps {
  products: Product[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (productId: string) => void;
  recentScanIds: string[];
  onTriggerWebSearch: (query: string) => void;
  onSelectUnlistedItem: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  products,
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  recentScanIds,
  onTriggerWebSearch,
  onSelectUnlistedItem,
}) => {
  const categoryScrollRef = useRef<ScrollView>(null);
  const [categoryScrollDirection, setCategoryScrollDirection] = useState<'right' | 'left'>('right');
  const [categoryScrollX, setCategoryScrollX] = useState(0);

  const handleCategoryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollX = contentOffset.x;
    setCategoryScrollX(scrollX);
    if (scrollX + layoutMeasurement.width >= contentSize.width - 15) {
      setCategoryScrollDirection('left');
    } else if (scrollX <= 15) {
      setCategoryScrollDirection('right');
    }
  };

  const handleToggleCategoryScroll = () => {
    if (categoryScrollDirection === 'right') {
      categoryScrollRef.current?.scrollTo({ x: categoryScrollX + 160, animated: true });
    } else {
      categoryScrollRef.current?.scrollTo({ x: Math.max(0, categoryScrollX - 160), animated: true });
    }
  };

  // Filtered products calculation
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Live Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Search size={17} color={COLORS.slate[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brand, item, or category..."
          placeholderTextColor={COLORS.slate[400]}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchQueryChange('')}
            style={styles.clearSearchButton}
            activeOpacity={0.7}
          >
            <X size={16} color={COLORS.slate[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Category Filter Pills with Scroll Control */}
      <View style={styles.categoryRowWrapper}>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleCategoryScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => onSelectCategory(cat)}
                style={[
                  styles.categoryPill,
                  isSelected ? styles.categoryPillSelected : styles.categoryPillDefault,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected ? styles.categoryPillTextSelected : styles.categoryPillTextDefault,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={handleToggleCategoryScroll}
          style={styles.categoryArrowButton}
          activeOpacity={0.7}
        >
          {categoryScrollDirection === 'right' ? (
            <ChevronRight size={15} color={COLORS.emerald[700]} strokeWidth={2.4} />
          ) : (
            <ChevronLeft size={15} color={COLORS.emerald[700]} strokeWidth={2.4} />
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Catalog Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>
          Products ({filteredProducts.length})
        </Text>
        <Text style={styles.sectionHeaderSubtitle}>Tap card for details</Text>
      </View>

      {/* 4. Products Grid or Empty Fallback */}
      {filteredProducts.length === 0 ? (
        <View style={styles.noResultsCard}>
          <View style={styles.noResultsIconBox}>
            <Info size={26} color={COLORS.amber[600]} />
          </View>
          <Text style={styles.noResultsTitle}>Product not in list yet</Text>
          <Text style={styles.noResultsSubtitle}>
            Tap below to search Google for live eco facts and packaging details on any Indian brand.
          </Text>

          <View style={styles.noResultsActions}>
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                onPress={() => onTriggerWebSearch(searchQuery.trim())}
                style={styles.webSearchButton}
                activeOpacity={0.85}
              >
                <Globe size={15} color={COLORS.white} />
                <Text style={styles.webSearchButtonText}>
                  Search Web for &ldquo;{searchQuery}&rdquo;
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onSelectUnlistedItem}
              style={styles.unlistedButton}
              activeOpacity={0.7}
            >
              <Text style={styles.unlistedButtonText}>Try Unlisted Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.productGrid}>
          {filteredProducts.map((prod) => (
            <View key={prod.id} style={styles.productGridItem}>
              <ProductCard
                product={prod}
                onPress={() => onSelectProduct(prod.id)}
              />
            </View>
          ))}
        </View>
      )}

      {/* 5. Recently Viewed Scans Section */}
      {recentScanIds.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.recentTitleGroup}>
              <RefreshCw size={15} color={COLORS.emerald[700]} strokeWidth={2.2} />
              <Text style={styles.sectionHeaderTitle}>Recently Viewed</Text>
            </View>
            <Text style={styles.sectionHeaderSubtitle}>Quick access</Text>
          </View>

          <View style={styles.recentGrid}>
            {recentScanIds.slice(0, 4).map((id) => {
              const item = INITIAL_PRODUCTS.find((p) => p.id === id);
              if (!item) return null;
              const badge = getTrafficBadgeInfo(item.trafficLight);
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => onSelectProduct(id)}
                  style={styles.recentCard}
                  activeOpacity={0.75}
                >
                  <View style={styles.recentTopRow}>
                    <Text style={styles.recentBrand} numberOfLines={1}>
                      {item.brand}
                    </Text>
                    <View style={styles.recentScorePill}>
                      <Text style={styles.recentScoreText}>{item.overallScoreNum}/100</Text>
                    </View>
                  </View>

                  <Text style={styles.recentName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <View style={styles.recentFooter}>
                    <View style={[styles.recentBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <View style={[styles.recentDot, { backgroundColor: badge.dot }]} />
                      <Text style={[styles.recentBadgeText, { color: badge.text }]} numberOfLines={1}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  searchIcon: {
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.slate[900],
    paddingVertical: 9,
  },
  clearSearchButton: {
    padding: 6,
  },
  categoryRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 16,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingRight: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 22,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillDefault: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    ...SHADOWS.card,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.emerald[600],
    ...SHADOWS.glow,
  },
  categoryPillText: {
    fontSize: 12,
  },
  categoryPillTextDefault: {
    color: COLORS.slate[700],
    fontWeight: '600',
  },
  categoryPillTextSelected: {
    color: COLORS.white,
    fontWeight: '800',
  },
  categoryArrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 3,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate[900],
    letterSpacing: -0.3,
  },
  sectionHeaderSubtitle: {
    fontSize: 11.5,
    color: COLORS.slate[500],
    fontWeight: '500',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productGridItem: {
    width: '48.5%',
  },
  noResultsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 22,
    alignItems: 'center',
    gap: 9,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  noResultsIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.amber[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  noResultsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  noResultsSubtitle: {
    fontSize: 12,
    color: COLORS.slate[500],
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  noResultsActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    justifyContent: 'center',
  },
  webSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    ...SHADOWS.glow,
  },
  webSearchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  unlistedButton: {
    backgroundColor: COLORS.slate[100],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  unlistedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[700],
  },
  recentSection: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200],
  },
  recentTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  recentCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 11,
    justifyContent: 'space-between',
    minHeight: 90,
    ...SHADOWS.card,
  },
  recentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  recentBrand: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.slate[500],
    flex: 1,
  },
  recentScorePill: {
    backgroundColor: COLORS.slate[100],
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  recentScoreText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.slate[700],
  },
  recentName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate[900],
    lineHeight: 15,
    marginBottom: 6,
  },
  recentFooter: {
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  recentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  recentBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
