import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Share,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Check,
  Package,
  TrendingDown,
  Leaf,
  HeartHandshake,
  MapPin,
  Info,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Wifi,
} from 'lucide-react-native';
import { COLORS, SHADOWS, getTrafficBadgeInfo } from '../theme/colors';
import { Product, UserPreferences, LiveAuditResult, GroundedAuditResult } from '../types';
import { PillarCard } from '../components/PillarCard';
import { GreenwashingRadar } from '../components/GreenwashingRadar';
import { LiveWebAuditCard } from '../components/LiveWebAuditCard';
import {
  MetricsGridSkeleton,
  ScoreBannerSkeleton,
  AnalysisTextSkeleton,
  SourcesChipsSkeleton,
  SkeletonBlock,
} from '../components/SkeletonLoader';

interface AuditScreenProps {
  product: Product;
  unlistedName?: string | null;
  preferences: UserPreferences;
  bookmarkedIds: string[];
  onToggleBookmark: (productId: string) => void;
  onGoHome: () => void;
  onViewAlternatives: () => void;
  liveAuditResult?: LiveAuditResult;
  isLiveSearching: boolean;
  onTriggerLiveSearch: () => void;
  /** Real-time Gemini Search Grounding structured result */
  groundedResult?: GroundedAuditResult | null;
  /** True while analyzeProductGrounded() is in-flight */
  isGroundedLoading: boolean;
  /** Re-fetch grounded analysis (bypass cache) */
  onRefreshGrounded: () => void;
}

export const AuditScreen: React.FC<AuditScreenProps> = ({
  product,
  unlistedName,
  preferences,
  bookmarkedIds,
  onToggleBookmark,
  onGoHome,
  onViewAlternatives,
  liveAuditResult,
  isLiveSearching,
  onTriggerLiveSearch,
  groundedResult,
  isGroundedLoading,
  onRefreshGrounded,
}) => {
  const isBookmarked = bookmarkedIds.includes(product.id);
  const badge = getTrafficBadgeInfo(product.trafficLight);

  // If a live grounded result is available, override badge info with real-time data
  const liveBadge = groundedResult
    ? getTrafficBadgeInfo(groundedResult.overallScore.toLowerCase() as any)
    : null;
  const activeBadge = liveBadge || badge;
  const activeScore = groundedResult?.overallScoreNum ?? product.overallScoreNum;

  // Helper: maps a grounded level string to traffic-light dot color
  const levelToColor = (level?: 'GREEN' | 'YELLOW' | 'RED') => {
    if (level === 'GREEN') return COLORS.emerald[500];
    if (level === 'RED') return COLORS.rose[500];
    return COLORS.amber[400];
  };


  const dynamicAiExplanation = React.useMemo(() => {
    if (!product) return '';

    const priorityMatches: string[] = [];
    const priorityConflicts: string[] = [];

    if (preferences.zeroPlastic) {
      if (product.pillars.packaging.score === 'green') {
        priorityMatches.push('uses plastic-free or easily recyclable packaging');
      } else {
        priorityConflicts.push('uses hard-to-recycle plastic packaging');
      }
    }

    if (preferences.carbonFootprint) {
      if (product.pillars.carbon.score === 'green') {
        priorityMatches.push('keeps carbon pollution low');
      } else if (product.pillars.carbon.score === 'red') {
        priorityConflicts.push('creates high carbon pollution from shipping or processing');
      }
    }

    if (preferences.localSourcing) {
      if (product.pillars.local.score === 'green') {
        priorityMatches.push('is locally made in India');
      } else {
        priorityConflicts.push('relies heavily on imported ingredients');
      }
    }

    if (preferences.ethicalSourcing) {
      if (product.pillars.ethicalSourcing.score === 'green') {
        priorityMatches.push('supports fair pay for workers and farmers');
      } else if (product.pillars.ethicalSourcing.score === 'yellow') {
        priorityMatches.push('partially meets fair-labor standards');
      }
    }

    if (preferences.veganCrueltyFree) {
      if (product.pillars.vegan.score === 'green') {
        priorityMatches.push('is 100% plant-based and cruelty-free');
      } else {
        priorityConflicts.push('contains dairy or animal ingredients');
      }
    }

    let dynamicTail = '';
    if (priorityMatches.length > 0 && priorityConflicts.length > 0) {
      dynamicTail = ` Based on your priorities, it ${priorityMatches.join(', ')}, but ${priorityConflicts.join(' and ')}.`;
    } else if (priorityConflicts.length > 0) {
      dynamicTail = ` Based on your priorities, note that it ${priorityConflicts.join(' and ')}.`;
    } else if (priorityMatches.length > 0) {
      dynamicTail = ` Based on your priorities, it ${priorityMatches.join(', ')}.`;
    }

    return `${product.baseAiExplanation}${dynamicTail}`;
  }, [product, preferences]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the sustainability audit for ${product.name} on EcoLens! Score: ${product.overallScoreNum}/100.`,
      });
    } catch {
      // Ignored
    }
  };

  // If unlisted item was photo scanned
  if (unlistedName) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Top Action Bar */}
        <View style={styles.topActionBar}>
          <TouchableOpacity
            onPress={onGoHome}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={16} color={COLORS.emerald[800]} strokeWidth={2.4} />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Live Grounded Result Display for Photo Scanned Item */}
        {groundedResult ? (
          <View style={styles.dashboardHeroCard}>
            <View
              style={[
                styles.trafficLightBanner,
                { backgroundColor: activeBadge.bg, borderColor: activeBadge.border },
              ]}
            >
              <View style={styles.bannerLeft}>
                <View style={[styles.trafficLightPill, { backgroundColor: activeBadge.pillBg }]}>
                  <View style={[styles.trafficLightDot, { backgroundColor: activeBadge.dot }]} />
                  <Text style={[styles.trafficLightLabel, { color: activeBadge.text }]}>
                    {activeBadge.label.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.liveDataPill}>
                  <Wifi size={9} color={COLORS.emerald[700]} />
                  <Text style={styles.liveDataPillText}>Live Grounded</Text>
                </View>
              </View>

              <View style={styles.bannerRight}>
                <View style={styles.scoreGaugeContainer}>
                  <Text style={[styles.scoreGaugeNumber, { color: activeBadge.text }]}>
                    {activeScore}
                  </Text>
                  <Text style={[styles.scoreGaugeTotal, { color: activeBadge.text }]}>/100</Text>
                </View>
                <TouchableOpacity
                  onPress={onRefreshGrounded}
                  disabled={isGroundedLoading}
                  style={styles.refreshScoreButton}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={12} color={activeBadge.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingVertical: 14 }}>
              <Text style={styles.heroProductName} numberOfLines={2}>
                {groundedResult.productName || unlistedName}
              </Text>
              <Text style={styles.heroBrandText}>
                Brand: <Text style={styles.heroBrandBold}>{groundedResult.brand}</Text>
              </Text>
            </View>

            {/* 3 Grounded Metrics Cards */}
            <View style={styles.summaryMetricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.metricIconBox, { backgroundColor: COLORS.emerald[100] }]}>
                    <TrendingDown size={15} color={COLORS.emerald[700]} />
                  </View>
                  <View
                    style={[
                      styles.metricStatusDot,
                      { backgroundColor: levelToColor(groundedResult.scores?.carbon?.level) },
                    ]}
                  />
                </View>
                <Text style={styles.metricCardTitle}>Carbon Footprint</Text>
                <Text style={styles.metricCardValue}>
                  {groundedResult.scores?.carbon?.level || 'N/A'}
                </Text>
                <Text style={styles.metricCardDetail} numberOfLines={3}>
                  {groundedResult.scores?.carbon?.summary || 'Calculated via live web data'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.metricIconBox, { backgroundColor: COLORS.amber[100] }]}>
                    <Package size={15} color={COLORS.amber[700]} />
                  </View>
                  <View
                    style={[
                      styles.metricStatusDot,
                      { backgroundColor: levelToColor(groundedResult.scores?.packaging?.level) },
                    ]}
                  />
                </View>
                <Text style={styles.metricCardTitle}>Packaging &amp; Plastic</Text>
                <Text style={styles.metricCardValue}>
                  {groundedResult.scores?.packaging?.level || 'N/A'}
                </Text>
                <Text style={styles.metricCardDetail} numberOfLines={3}>
                  {groundedResult.scores?.packaging?.summary || 'Calculated via live web data'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.metricIconBox, { backgroundColor: COLORS.pink[100] }]}>
                    <HeartHandshake size={15} color={COLORS.pink[700]} />
                  </View>
                  <View
                    style={[
                      styles.metricStatusDot,
                      { backgroundColor: levelToColor(groundedResult.scores?.ethics?.level) },
                    ]}
                  />
                </View>
                <Text style={styles.metricCardTitle}>Ethical Sourcing</Text>
                <Text style={styles.metricCardValue}>
                  {groundedResult.scores?.ethics?.level || 'N/A'}
                </Text>
                <Text style={styles.metricCardDetail} numberOfLines={3}>
                  {groundedResult.scores?.ethics?.summary || 'Calculated via live web data'}
                </Text>
              </View>
            </View>

            {/* AI Analysis Summary */}
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <View style={styles.analysisTitleGroup}>
                  <View style={styles.analysisIconBox}>
                    <Sparkles size={16} color={COLORS.emerald[700]} />
                  </View>
                  <View>
                    <Text style={styles.analysisTitle}>AI Sustainability Analysis</Text>
                    <Text style={styles.analysisTitleSub}>Gemini · Google Search Grounded</Text>
                  </View>
                </View>
                <View style={[styles.unbiasedBadge, styles.unbiasedBadgeLive]}>
                  <Text style={[styles.unbiasedBadgeText, styles.unbiasedBadgeTextLive]}>
                    Live Grounded
                  </Text>
                </View>
              </View>

              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{groundedResult.rawAnalysis}</Text>
              </View>

              {/* Real Web Sources & Citations */}
              {groundedResult.sources && groundedResult.sources.length > 0 && (
                <View style={styles.sourcesSection}>
                  <Text style={styles.sourcesHeader}>
                    Web Citations ({groundedResult.sources.length}):
                  </Text>
                  <View style={styles.sourcesRow}>
                    {groundedResult.sources.map((url, idx) => {
                      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => Linking.openURL(url).catch(() => {})}
                          style={styles.sourceChip}
                          activeOpacity={0.7}
                        >
                          <ExternalLink size={10} color={COLORS.pink[600]} />
                          <Text style={styles.sourceChipText} numberOfLines={1}>
                            {domain}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : isGroundedLoading ? (
          <View style={styles.unlistedCard}>
            <ScoreBannerSkeleton />
            <MetricsGridSkeleton />
            <AnalysisTextSkeleton />
            <Text style={[styles.unlistedSubtitle, { marginTop: 16, textAlign: 'center' }]}>
              EcoLens AI is reading label &amp; retrieving live web facts...
            </Text>
          </View>
        ) : (
          <View style={styles.unlistedCard}>
            <View style={styles.unlistedIconBox}>
              <AlertTriangle size={28} color={COLORS.amber[700]} />
            </View>
            <Text style={styles.unlistedTitle}>{unlistedName}</Text>
            <View style={styles.unlistedAlert}>
              <Text style={styles.unlistedAlertText}>
                No static catalog data is used. Live web search is ready.
              </Text>
            </View>
            <Text style={styles.unlistedSubtitle}>
              Tap below to execute a real-time Google Search Grounding audit for this product.
            </Text>

            <TouchableOpacity
              onPress={onRefreshGrounded}
              disabled={isGroundedLoading}
              style={styles.unlistedSearchBtn}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color={COLORS.white} />
              <Text style={styles.unlistedSearchBtnText}>
                {isGroundedLoading ? 'Searching the web...' : 'Retrieve Live Web Data'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Action Bar */}
      <View style={styles.topActionBar}>
        <TouchableOpacity
          onPress={onGoHome}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color={COLORS.emerald[800]} strokeWidth={2.4} />
          <Text style={styles.backButtonText}>All Products</Text>
        </TouchableOpacity>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            onPress={() => onToggleBookmark(product.id)}
            style={[
              styles.actionPill,
              isBookmarked ? styles.bookmarkedPill : styles.actionPillDefault,
            ]}
            activeOpacity={0.7}
          >
            <Bookmark
              size={14}
              color={isBookmarked ? COLORS.emerald[700] : COLORS.slate[600]}
              fill={isBookmarked ? COLORS.emerald[700] : 'transparent'}
            />
            <Text
              style={[
                styles.actionPillText,
                isBookmarked ? styles.bookmarkedPillText : styles.actionPillTextDefault,
              ]}
            >
              {isBookmarked ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={[styles.actionPill, styles.actionPillDefault]}
            activeOpacity={0.7}
          >
            <Share2 size={14} color={COLORS.slate[600]} />
            <Text style={[styles.actionPillText, styles.actionPillTextDefault]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================
          REDESIGNED PROMINENT TRAFFIC-LIGHT DASHBOARD HEADER
         ======================================================== */}
      <View style={styles.dashboardHeroCard}>
        {/* Top Prominent Traffic Light Status Banner — uses live grounded data when available */}
        {isGroundedLoading && !groundedResult ? (
          <ScoreBannerSkeleton />
        ) : (
          <View style={[styles.trafficLightBanner, { backgroundColor: activeBadge.bg, borderColor: activeBadge.border }]}>
            <View style={styles.bannerLeft}>
              <View style={[styles.trafficLightPill, { backgroundColor: activeBadge.pillBg }]}>
                <View style={[styles.trafficLightDot, { backgroundColor: activeBadge.dot }]} />
                <Text style={[styles.trafficLightLabel, { color: activeBadge.text }]}>
                  {activeBadge.label.toUpperCase()}
                </Text>
              </View>
              {groundedResult && !groundedResult.isFromCache && (
                <View style={styles.liveDataPill}>
                  <Wifi size={9} color={COLORS.emerald[700]} />
                  <Text style={styles.liveDataPillText}>Live</Text>
                </View>
              )}
            </View>

            <View style={styles.bannerRight}>
              <View style={styles.scoreGaugeContainer}>
                <Text style={[styles.scoreGaugeNumber, { color: activeBadge.text }]}>
                  {activeScore}
                </Text>
                <Text style={[styles.scoreGaugeTotal, { color: activeBadge.text }]}>/100</Text>
              </View>
              <TouchableOpacity
                onPress={onRefreshGrounded}
                disabled={isGroundedLoading}
                style={styles.refreshScoreButton}
                activeOpacity={0.7}
              >
                <RefreshCw size={12} color={activeBadge.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Product Photo & Identification */}
        <View style={styles.heroProductRow}>
          <View style={styles.heroImageFrame}>
            <Image
              source={{ uri: product.image }}
              style={styles.heroProductImg}
              resizeMode="cover"
            />
          </View>

          <View style={styles.heroInfoContent}>
            <View style={styles.heroCategoryChip}>
              <Text style={styles.heroCategoryChipText}>{product.category}</Text>
            </View>
            <Text style={styles.heroProductName} numberOfLines={2}>
              {groundedResult?.productName || product.name}
            </Text>
            <Text style={styles.heroBrandText}>
              Brand: <Text style={styles.heroBrandBold}>{groundedResult?.brand || product.brand}</Text>
            </Text>

            <View style={styles.confidenceRow}>
              {groundedResult && !groundedResult.isFromCache ? (
                <View style={styles.verifiedConfidenceTag}>
                  <Wifi size={12} color={COLORS.emerald[700]} />
                  <Text style={styles.verifiedConfidenceText}>Live Web Verified</Text>
                </View>
              ) : product.confidence === 'limited' ? (
                <View style={styles.estimatedConfidenceTag}>
                  <Info size={12} color={COLORS.amber[700]} />
                  <Text style={styles.estimatedConfidenceText}>Estimated Score</Text>
                </View>
              ) : (
                <View style={styles.verifiedConfidenceTag}>
                  <ShieldCheck size={13} color={COLORS.emerald[700]} />
                  <Text style={styles.verifiedConfidenceText}>Verified Eco Check</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Action to Swaps */}
        {product.alternatives.length > 0 && (
          <TouchableOpacity
            onPress={onViewAlternatives}
            style={styles.swapActionBanner}
            activeOpacity={0.85}
          >
            <View style={styles.swapActionLeft}>
              <Sparkles size={16} color={COLORS.white} />
              <Text style={styles.swapActionTitle}>Greener Swap Available</Text>
            </View>
            <ArrowRight size={15} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* ========================================================
          THREE KEY VISUAL METRICS SUMMARY CARDS
          — overlaid with live Gemini grounded data when available
         ======================================================== */}
      {isGroundedLoading && !groundedResult ? (
        <MetricsGridSkeleton />
      ) : (
        <View style={styles.summaryMetricsGrid}>
          {/* Metric 1: Carbon Footprint */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.metricIconBox, { backgroundColor: COLORS.emerald[100] }]}>
                <TrendingDown size={15} color={COLORS.emerald[700]} />
              </View>
              <View
                style={[
                  styles.metricStatusDot,
                  {
                    backgroundColor: groundedResult
                      ? levelToColor(groundedResult.scores.carbon.level)
                      : product.pillars.carbon.score === 'green'
                      ? COLORS.emerald[500]
                      : product.pillars.carbon.score === 'yellow'
                      ? COLORS.amber[400]
                      : COLORS.rose[500],
                  },
                ]}
              />
            </View>
            <Text style={styles.metricCardTitle}>Carbon Footprint</Text>
            <Text style={styles.metricCardValue} numberOfLines={2}>
              {groundedResult
                ? groundedResult.scores.carbon.level
                : product.pillars.carbon.metric}
            </Text>
            <Text style={styles.metricCardDetail} numberOfLines={3}>
              {groundedResult
                ? groundedResult.scores.carbon.summary
                : product.lcaSummary.carbonPerUnit}
            </Text>
          </View>

          {/* Metric 2: Packaging / Plastic Use */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.metricIconBox, { backgroundColor: COLORS.amber[100] }]}>
                <Package size={15} color={COLORS.amber[700]} />
              </View>
              <View
                style={[
                  styles.metricStatusDot,
                  {
                    backgroundColor: groundedResult
                      ? levelToColor(groundedResult.scores.packaging.level)
                      : product.pillars.packaging.score === 'green'
                      ? COLORS.emerald[500]
                      : product.pillars.packaging.score === 'yellow'
                      ? COLORS.amber[400]
                      : COLORS.rose[500],
                  },
                ]}
              />
            </View>
            <Text style={styles.metricCardTitle}>Packaging & Plastic</Text>
            <Text style={styles.metricCardValue} numberOfLines={2}>
              {groundedResult
                ? groundedResult.scores.packaging.level
                : product.pillars.packaging.metric}
            </Text>
            <Text style={styles.metricCardDetail} numberOfLines={3}>
              {groundedResult
                ? groundedResult.scores.packaging.summary
                : product.lcaSummary.recyclabilityRate}
            </Text>
          </View>

          {/* Metric 3: Ethical Sourcing */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.metricIconBox, { backgroundColor: COLORS.pink[100] }]}>
                <HeartHandshake size={15} color={COLORS.pink[700]} />
              </View>
              <View
                style={[
                  styles.metricStatusDot,
                  {
                    backgroundColor: groundedResult
                      ? levelToColor(groundedResult.scores.ethics.level)
                      : product.pillars.ethicalSourcing.score === 'green'
                      ? COLORS.emerald[500]
                      : product.pillars.ethicalSourcing.score === 'yellow'
                      ? COLORS.amber[400]
                      : COLORS.rose[500],
                  },
                ]}
              />
            </View>
            <Text style={styles.metricCardTitle}>Ethical Sourcing</Text>
            <Text style={styles.metricCardValue} numberOfLines={2}>
              {groundedResult
                ? groundedResult.scores.ethics.level
                : product.pillars.ethicalSourcing.metric}
            </Text>
            <Text style={styles.metricCardDetail} numberOfLines={3}>
              {groundedResult
                ? groundedResult.scores.ethics.summary
                : product.pillars.local.metric}
            </Text>
          </View>
        </View>
      )}

      {/* Greenwashing Alert Radar (if applicable) */}
      {product.greenwashingAlert && (
        <GreenwashingRadar alertText={product.greenwashingAlert} />
      )}

      {/* AI Sustainability Analysis Card */}
      <View style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <View style={styles.analysisTitleGroup}>
            <View style={styles.analysisIconBox}>
              <Sparkles size={16} color={COLORS.emerald[700]} />
            </View>
            <View>
              <Text style={styles.analysisTitle}>AI Sustainability Analysis</Text>
              {groundedResult && !groundedResult.isFromCache && (
                <Text style={styles.analysisTitleSub}>Gemini · Google Search Grounded</Text>
              )}
            </View>
          </View>
          <View style={[
            styles.unbiasedBadge,
            groundedResult && !groundedResult.isFromCache && styles.unbiasedBadgeLive,
          ]}>
            <Text style={[
              styles.unbiasedBadgeText,
              groundedResult && !groundedResult.isFromCache && styles.unbiasedBadgeTextLive,
            ]}>
              {groundedResult && !groundedResult.isFromCache ? 'Live Grounded' : 'Objective Audit'}
            </Text>
          </View>
        </View>

        {isGroundedLoading && !groundedResult ? (
          <AnalysisTextSkeleton />
        ) : (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              {groundedResult?.rawAnalysis || dynamicAiExplanation}
            </Text>
          </View>
        )}

        {/* Key Takeaways */}
        <View style={styles.takeawaysSection}>
          <Text style={styles.takeawaysHeader}>Key Takeaways</Text>
          {product.sustainabilityFacts.map((fact, idx) => (
            <View key={idx} style={styles.takeawayItem}>
              <Check size={14} color={COLORS.emerald[600]} strokeWidth={2.5} style={styles.checkIcon} />
              <Text style={styles.takeawayText}>{fact}</Text>
            </View>
          ))}
        </View>

        {/* Web Citations from Grounded Search */}
        {groundedResult && groundedResult.sources.length > 0 && (
          <View style={styles.sourcesSection}>
            <Text style={styles.sourcesHeader}>
              Web Sources ({groundedResult.sources.length})
            </Text>
            {isGroundedLoading ? (
              <SourcesChipsSkeleton />
            ) : (
              <View style={styles.sourcesRow}>
                {groundedResult.sources.slice(0, 5).map((url, idx) => {
                  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => Linking.openURL(url).catch(() => {})}
                      style={styles.sourceChip}
                      activeOpacity={0.7}
                    >
                      <ExternalLink size={10} color={COLORS.pink[600]} />
                      <Text style={styles.sourceChipText} numberOfLines={1}>
                        {domain}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Live Web Check Grounding Card */}
      <LiveWebAuditCard
        productName={product.name}
        brand={product.brand}
        auditResult={liveAuditResult}
        isLoading={isLiveSearching}
        onRefresh={onTriggerLiveSearch}
      />

      {/* 5-Pillar Eco Breakdown */}
      <View style={styles.pillarsSection}>
        <View style={styles.pillarsHeaderRow}>
          <Text style={styles.pillarsHeaderTitle}>Comprehensive Breakdown</Text>
          <Text style={styles.pillarsHeaderSubtitle}>5 Standardized Pillars</Text>
        </View>

        {/* 1. Packaging */}
        <PillarCard
          icon={<Package size={16} color={COLORS.slate[700]} />}
          pillar={product.pillars.packaging}
          isPriority={preferences.zeroPlastic}
        />

        {/* 2. Carbon */}
        <PillarCard
          icon={<TrendingDown size={16} color={COLORS.slate[700]} />}
          pillar={product.pillars.carbon}
          isPriority={preferences.carbonFootprint}
        />

        {/* 3. Vegan */}
        <PillarCard
          icon={<Leaf size={16} color={COLORS.slate[700]} />}
          pillar={product.pillars.vegan}
          isPriority={preferences.veganCrueltyFree}
        />

        {/* 4. Ethical */}
        <PillarCard
          icon={<HeartHandshake size={16} color={COLORS.slate[700]} />}
          pillar={product.pillars.ethicalSourcing}
          isPriority={preferences.ethicalSourcing}
        />

        {/* 5. Local */}
        <PillarCard
          icon={<MapPin size={16} color={COLORS.slate[700]} />}
          pillar={product.pillars.local}
          isPriority={preferences.localSourcing}
        />
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
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionPillDefault: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.slate[200],
  },
  bookmarkedPill: {
    backgroundColor: COLORS.emerald[50],
    borderColor: COLORS.emerald[300],
  },
  actionPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionPillTextDefault: {
    color: COLORS.slate[700],
  },
  bookmarkedPillText: {
    color: COLORS.emerald[800],
    fontWeight: '700',
  },
  dashboardHeroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  trafficLightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  trafficLightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trafficLightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficLightLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scoreGaugeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreGaugeNumber: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreGaugeTotal: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.75,
  },
  heroProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  heroImageFrame: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.slate[100],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  heroProductImg: {
    width: '100%',
    height: '100%',
  },
  heroInfoContent: {
    flex: 1,
    gap: 2,
  },
  heroCategoryChip: {
    backgroundColor: COLORS.emerald[50],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  heroCategoryChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  heroProductName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.slate[900],
    lineHeight: 18,
  },
  heroBrandText: {
    fontSize: 11,
    color: COLORS.slate[500],
  },
  heroBrandBold: {
    fontWeight: '700',
    color: COLORS.slate[800],
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedConfidenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.emerald[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  verifiedConfidenceText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  estimatedConfidenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.amber[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.amber[200],
  },
  estimatedConfidenceText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.amber[900],
  },
  swapActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.emerald[700],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 2,
    ...SHADOWS.glow,
  },
  swapActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  swapActionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  summaryMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 110,
    ...SHADOWS.card,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  metricCardTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.slate[600],
    marginBottom: 2,
  },
  metricCardValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.slate[900],
    lineHeight: 14,
    marginBottom: 2,
  },
  metricCardDetail: {
    fontSize: 10,
    color: COLORS.slate[500],
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  analysisTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.emerald[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  unbiasedBadge: {
    backgroundColor: COLORS.slate[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  unbiasedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.slate[600],
    textTransform: 'uppercase',
  },
  // Live grounded badge variant
  unbiasedBadgeLive: {
    backgroundColor: COLORS.emerald[50],
    borderColor: COLORS.emerald[300],
  },
  unbiasedBadgeTextLive: {
    color: COLORS.emerald[800],
  },
  // Banner layout helpers
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDataPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.emerald[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.emerald[300],
  },
  liveDataPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.emerald[700],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  refreshScoreButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
  },
  // Analysis card subtitle
  analysisTitleSub: {
    fontSize: 10,
    color: COLORS.emerald[700],
    fontWeight: '600',
    marginTop: 1,
  },
  // Web sources section
  sourcesSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
  },
  sourcesHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.pink[50],
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 160,
  },
  sourceChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.pink[800],
  },
  explanationBox: {
    backgroundColor: COLORS.slate[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 12,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 12,
    color: COLORS.slate[700],
    lineHeight: 18,
  },
  takeawaysSection: {
    gap: 6,
  },
  takeawaysHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.slate[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  checkIcon: {
    marginTop: 2,
  },
  takeawayText: {
    fontSize: 11.5,
    color: COLORS.slate[600],
    flex: 1,
    lineHeight: 16,
  },
  pillarsSection: {
    marginTop: 4,
  },
  pillarsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  pillarsHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  pillarsHeaderSubtitle: {
    fontSize: 11,
    color: COLORS.slate[500],
    fontWeight: '500',
  },
  unlistedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.amber[200],
    padding: 20,
    alignItems: 'center',
    gap: 10,
    ...SHADOWS.card,
  },
  unlistedIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.amber[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlistedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  unlistedAlert: {
    backgroundColor: COLORS.amber[50],
    borderWidth: 1,
    borderColor: COLORS.amber[200],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unlistedAlertText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.amber[900],
    textAlign: 'center',
  },
  unlistedSubtitle: {
    fontSize: 11.5,
    color: COLORS.slate[600],
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  unlistedSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.pink[600],
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    minHeight: 44,
  },
  unlistedSearchBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  unlistedBackBtn: {
    backgroundColor: COLORS.slate[100],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  unlistedBackBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[700],
  },
  unlistedResultBox: {
    marginTop: 10,
    backgroundColor: COLORS.slate[50],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    padding: 12,
    width: '100%',
  },
  unlistedResultHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald[900],
    marginBottom: 6,
  },
  unlistedResultText: {
    fontSize: 11.5,
    color: COLORS.slate[700],
    lineHeight: 16,
  },
});
