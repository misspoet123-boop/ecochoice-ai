import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Crown, X, Check, Sparkles } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface ProModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Top Row with Crown Icon and Close Button */}
          <View style={styles.topRow}>
            <View style={styles.crownBadge}>
              <Crown size={22} color={COLORS.white} strokeWidth={2.3} />
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              accessibilityLabel="Close Pro modal"
            >
              <X size={18} color={COLORS.slate[500]} />
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <View style={styles.headingGroup}>
            <Text style={styles.tierTag}>Enterprise &amp; Conscious Shopper</Text>
            <Text style={styles.mainTitle}>EcoLens Pro Tier</Text>
            <Text style={styles.subtitle}>
              Advanced life-cycle assessments, batch grocery receipt photo scanning, and automated greenwashing radar.
            </Text>
          </View>

          {/* Feature Checklist Box */}
          <View style={styles.featureBox}>
            <View style={styles.featureItem}>
              <Check size={16} color={COLORS.emerald[600]} strokeWidth={2.5} />
              <Text style={styles.featureText}>
                Full Scope 1, 2, and 3 GHG life-cycle assessment breakdowns
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Check size={16} color={COLORS.emerald[600]} strokeWidth={2.5} />
              <Text style={styles.featureText}>
                Batch grocery bill &amp; quick-commerce cart audit (Blinkit/Zepto/Instamart)
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Check size={16} color={COLORS.emerald[600]} strokeWidth={2.5} />
              <Text style={styles.featureText}>
                Unlimited offline caching for low-network Indian supermarkets
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Check size={16} color={COLORS.emerald[600]} strokeWidth={2.5} />
              <Text style={styles.featureText}>
                Custom corporate ESG transparency alerts for consumer goods
              </Text>
            </View>
          </View>

          {/* Pricing & CTA */}
          <View style={styles.pricingSection}>
            <View style={styles.priceRow}>
              <View>
                <View style={styles.priceWrapper}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.amount}>199</Text>
                  <Text style={styles.period}> / month</Text>
                </View>
                <Text style={styles.offerBadge}>Special Introductory Launch Price</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.trialButton}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color={COLORS.white} />
              <Text style={styles.trialButtonText}>Start 7-Day Free Trial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.amber[300],
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  crownBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.amber[500],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingGroup: {
    marginBottom: 14,
  },
  tierTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.amber[800],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.slate[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11.5,
    color: COLORS.slate[600],
    lineHeight: 16,
  },
  featureBox: {
    backgroundColor: COLORS.slate[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 11.5,
    color: COLORS.slate[700],
    flex: 1,
    lineHeight: 16,
  },
  pricingSection: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  amount: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.slate[900],
  },
  period: {
    fontSize: 12,
    color: COLORS.slate[500],
  },
  offerBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.pink[600],
    marginTop: 2,
  },
  trialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pink[600],
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    shadowColor: COLORS.pink[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 46,
  },
  trialButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
});
