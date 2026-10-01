import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/theme/colors';
import { Product, TabType, UserPreferences, LiveAuditResult } from './src/types';
import { INITIAL_PRODUCTS } from './src/data/mockProducts';
import { auditProductLive } from './src/services/geminiService';
import { useGroundedAudit } from './src/hooks/useGroundedAudit';

// Components
import { AppHeader } from './src/components/AppHeader';
import { BottomTabBar } from './src/components/BottomTabBar';
import { CameraScannerModal } from './src/components/CameraScannerModal';
import { ProModal } from './src/components/ProModal';
import { DrawerMenu } from './src/components/DrawerMenu';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { AuditScreen } from './src/screens/AuditScreen';
import { SwapsScreen } from './src/screens/SwapsScreen';
import { PreferencesScreen } from './src/screens/PreferencesScreen';

export default function App() {
  // Navigation & Screen State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [previousTab, setPreviousTab] = useState<TabType>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('mamaearth-onion-shampoo');
  const [unlistedScannedName, setUnlistedScannedName] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Panels State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // User Eco Priorities
  const [preferences, setPreferences] = useState<UserPreferences>({
    carbonFootprint: true,
    zeroPlastic: true,
    veganCrueltyFree: false,
    ethicalSourcing: true,
    localSourcing: true,
  });

  // Recent Scans & Bookmarks
  const [recentScanIds, setRecentScanIds] = useState<string[]>([
    'mamaearth-onion-shampoo',
    'tata-tea-premium',
    'fortune-refined-sunflower-oil',
    'lays-magic-masala',
  ]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    'tata-tea-premium',
    'fabindia-cotton-kurta',
  ]);

  // Live Google Search Grounding State (narrative text format)
  const [isLiveSearching, setIsLiveSearching] = useState<boolean>(false);
  const [liveAuditResults, setLiveAuditResults] = useState<{
    [key: string]: LiveAuditResult;
  }>({});

  // Gemini Search-Grounded structured product analysis (JSON schema format)
  const {
    groundedResult,
    isLoading: isGroundedLoading,
    triggerAnalysis: triggerGroundedAnalysis,
  } = useGroundedAudit();

  // Current active product
  const currentProduct = useMemo(() => {
    return INITIAL_PRODUCTS.find((p) => p.id === selectedProductId) || INITIAL_PRODUCTS[0];
  }, [selectedProductId]);

  const activePreferencesCount = useMemo(() => {
    return Object.values(preferences).filter(Boolean).length;
  }, [preferences]);

  // Handlers
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setUnlistedScannedName(null);
    if (!recentScanIds.includes(productId)) {
      setRecentScanIds((prev) => [productId, ...prev.slice(0, 9)]);
    }
    if (activeTab !== 'prefs') {
      setPreviousTab(activeTab);
    }
    setActiveTab('audit');

    // Auto-trigger grounded analysis for the selected product
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    if (product) {
      triggerGroundedAnalysis(product.name, product.brand, productId);
    }
  };

  const handleTogglePreference = (key: keyof UserPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetPreferences = () => {
    setPreferences({
      carbonFootprint: true,
      zeroPlastic: true,
      veganCrueltyFree: false,
      ethicalSourcing: true,
      localSourcing: true,
    });
  };

  const handleToggleBookmark = (productId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle profile icon: if on 'prefs', go back to previous screen; otherwise open 'prefs'
  const handleToggleProfile = () => {
    if (activeTab === 'prefs') {
      setActiveTab(previousTab || 'home');
    } else {
      setPreviousTab(activeTab);
      setActiveTab('prefs');
    }
  };

  const handleProductIdentifiedFromCamera = (
    result: Product | { unlistedName: string }
  ) => {
    if (activeTab !== 'prefs') {
      setPreviousTab(activeTab);
    }
    if ('id' in result) {
      handleSelectProduct(result.id);
    } else {
      setUnlistedScannedName(result.unlistedName);
      setActiveTab('audit');
    }
  };

  // Live Google Search Grounding trigger
  const handleTriggerLiveSearch = async (customQuery?: string) => {
    setIsLiveSearching(true);
    const key = customQuery || (unlistedScannedName ? `unlisted-${unlistedScannedName}` : currentProduct.id);

    try {
      const data = await auditProductLive(
        customQuery || (unlistedScannedName ? unlistedScannedName : currentProduct.name),
        unlistedScannedName ? 'Indian Retail Brand' : currentProduct.brand,
        customQuery
      );

      setLiveAuditResults((prev) => ({
        ...prev,
        [key]: data,
      }));
    } catch (err: any) {
      console.warn('Live audit fetch error:', err);
    } finally {
      setIsLiveSearching(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.white}
          translucent={false}
        />

        {/* Outer Mobile Wrapper Container (max-w-md on web, full width on mobile) */}
        <View style={styles.appShell}>
          {/* Top Brand Header Bar */}
          <AppHeader
            preferences={preferences}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenPro={() => setShowProModal(true)}
            onToggleProfile={handleToggleProfile}
            onGoHome={() => {
              setUnlistedScannedName(null);
              setPreviousTab(activeTab !== 'home' ? activeTab : 'home');
              setActiveTab('home');
            }}
          />

          {/* Main Body Router */}
          <View style={styles.mainContent}>
            {activeTab === 'home' && (
              <HomeScreen
                products={INITIAL_PRODUCTS}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectProduct={handleSelectProduct}
                recentScanIds={recentScanIds}
                onTriggerWebSearch={async (q) => {
                  setUnlistedScannedName(q);
                  setPreviousTab('home');
                  setActiveTab('audit');
                  await handleTriggerLiveSearch(q);
                }}
                onSelectUnlistedItem={() => {
                  setUnlistedScannedName('Unlisted Retail Product');
                  setPreviousTab('home');
                  setActiveTab('audit');
                }}
              />
            )}

            {activeTab === 'audit' && (
              <AuditScreen
                product={currentProduct}
                unlistedName={unlistedScannedName}
                preferences={preferences}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onGoHome={() => {
                  setPreviousTab('audit');
                  setActiveTab('home');
                }}
                onViewAlternatives={() => {
                  setPreviousTab('audit');
                  setActiveTab('swaps');
                }}
                liveAuditResult={
                  unlistedScannedName
                    ? liveAuditResults[`unlisted-${unlistedScannedName}`]
                    : liveAuditResults[currentProduct.id]
                }
                isLiveSearching={isLiveSearching}
                onTriggerLiveSearch={() => handleTriggerLiveSearch()}
                groundedResult={groundedResult}
                isGroundedLoading={isGroundedLoading}
                onRefreshGrounded={() =>
                  triggerGroundedAnalysis(
                    currentProduct.name,
                    currentProduct.brand,
                    currentProduct.id,
                    true // force bypass cache
                  )
                }
              />
            )}

            {activeTab === 'swaps' && (
              <SwapsScreen
                currentProduct={currentProduct}
                onSelectProduct={handleSelectProduct}
                onGoHome={() => {
                  setPreviousTab('swaps');
                  setActiveTab('home');
                }}
              />
            )}

            {activeTab === 'prefs' && (
              <PreferencesScreen
                preferences={preferences}
                onTogglePreference={handleTogglePreference}
                onResetPreferences={handleResetPreferences}
                onOpenPro={() => setShowProModal(true)}
              />
            )}
          </View>

          {/* Bottom Navigation Dock */}
          <BottomTabBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab !== 'prefs') {
                setPreviousTab(activeTab);
              }
              if (tab === 'home') setUnlistedScannedName(null);
              setActiveTab(tab);
            }}
            onLaunchScanner={() => setIsScannerOpen(true)}
            activePreferencesCount={activePreferencesCount}
          />

          {/* Camera Scanner Modal with Real Live Camera Feed */}
          <CameraScannerModal
            visible={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onProductIdentified={handleProductIdentifiedFromCamera}
          />

          {/* Pro Subscription Modal */}
          <ProModal
            visible={showProModal}
            onClose={() => setShowProModal(false)}
          />

          {/* Slide-over Side Drawer Menu (opens on the LEFT) */}
          <DrawerMenu
            visible={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab !== 'prefs') {
                setPreviousTab(activeTab);
              }
              setActiveTab(tab);
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenPro={() => setShowProModal(true)}
            activePreferencesCount={activePreferencesCount}
            bookmarkedIds={bookmarkedIds}
            onSelectProduct={handleSelectProduct}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  appShell: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 440 : undefined,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
});
