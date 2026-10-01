import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Globe, Sparkles, RefreshCw, ExternalLink } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { LiveAuditResult } from '../types';

interface LiveWebAuditCardProps {
  productName: string;
  brand: string;
  auditResult?: LiveAuditResult;
  isLoading: boolean;
  onRefresh: () => void;
}

export const LiveWebAuditCard: React.FC<LiveWebAuditCardProps> = ({
  productName,
  brand,
  auditResult,
  isLoading,
  onRefresh,
}) => {
  const handleOpenSource = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.warn('Cannot open url:', err));
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.iconContainer}>
            <Globe size={18} color={COLORS.pink[600]} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Live Web Check</Text>
            <Text style={styles.cardSubtitle}>Real-time Google Search Grounding</Text>
          </View>
        </View>

        <View style={styles.googleBadge}>
          <Text style={styles.googleBadgeText}>Google Search</Text>
        </View>
      </View>

      {/* Content Area */}
      {auditResult ? (
        <View style={styles.resultContent}>
          <View style={styles.textContainer}>
            <Text style={styles.auditText}>{auditResult.text}</Text>
          </View>

          {/* Web Sources & Citations */}
          {auditResult.sources && auditResult.sources.length > 0 && (
            <View style={styles.sourcesSection}>
              <Text style={styles.sourcesTitle}>
                Web Sources ({auditResult.sources.length}):
              </Text>
              <View style={styles.sourcesList}>
                {auditResult.sources.map((src, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleOpenSource(src.uri)}
                    style={styles.sourceChip}
                    activeOpacity={0.7}
                  >
                    <ExternalLink size={12} color={COLORS.pink[600]} />
                    <Text style={styles.sourceChipText} numberOfLines={1}>
                      {src.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Footer Timestamp */}
          <View style={styles.timestampRow}>
            <Text style={styles.timestampText}>
              Updated {new Date(auditResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            Want real-time facts on <Text style={styles.boldText}>{brand}</Text>? Tap below to search the web for latest news, plastic warnings, and eco-reports.
          </Text>
        </View>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        onPress={onRefresh}
        disabled={isLoading}
        style={styles.triggerButton}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.triggerButtonText}>Searching the web...</Text>
          </>
        ) : (
          <>
            <Sparkles size={16} color={COLORS.white} />
            <Text style={styles.triggerButtonText}>
              {auditResult ? 'Search Again for Latest Info' : 'Search Latest Web Info'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.pink[500],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.pink[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  cardSubtitle: {
    fontSize: 10.5,
    color: COLORS.slate[500],
  },
  googleBadge: {
    backgroundColor: COLORS.pink[50],
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  googleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.pink[700],
    textTransform: 'uppercase',
  },
  resultContent: {
    marginBottom: 10,
  },
  textContainer: {
    backgroundColor: COLORS.slate[50],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 12,
    marginBottom: 10,
  },
  auditText: {
    fontSize: 12,
    color: COLORS.slate[700],
    lineHeight: 18,
  },
  sourcesSection: {
    marginBottom: 8,
  },
  sourcesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sourcesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.pink[50],
    borderWidth: 1,
    borderColor: COLORS.pink[200],
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    maxWidth: '100%',
  },
  sourceChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.pink[800],
  },
  timestampRow: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  timestampText: {
    fontSize: 10,
    color: COLORS.slate[400],
  },
  placeholderBox: {
    backgroundColor: COLORS.slate[50],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 12,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.slate[600],
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.slate[900],
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pink[600],
    paddingVertical: 11,
    borderRadius: 14,
    gap: 7,
    shadowColor: COLORS.pink[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  triggerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
