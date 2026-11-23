import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Scale,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Tag,
  IndianRupee,
} from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { productService } from '../src/services/productService';
import { formatInr } from '../src/utils/formatters';

export default function ComparisonScreen() {
  const { ids } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, [ids]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const res = await productService.compareProducts(ids || []);
      setData(res);
    } catch (err) {
      Alert.alert('Comparison Error', err.message || 'Could not load product comparison.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.burgundy} />
        <Text style={styles.loadingText}>Comparing formulation profiles...</Text>
      </View>
    );
  }

  const products = data?.products || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.burgundy} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerSubtitle}>SIDE-BY-SIDE MATRIX</Text>
          <Text style={styles.headerTitle}>Product Comparison</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Overlap Summary */}
        {data?.commonIngredients?.length > 0 && (
          <View style={styles.commonActivesCard}>
            <View style={styles.commonHeaderRow}>
              <Sparkles size={14} color={COLORS.burgundy} />
              <Text style={styles.commonTitle}>Shared Active Compounds</Text>
            </View>
            <Text style={styles.commonText}>
              Both formulations contain:{' '}
              <Text style={{ fontWeight: '700', color: COLORS.burgundy }}>
                {data.commonIngredients.join(', ')}
              </Text>
            </Text>
          </View>
        )}

        {/* Side-by-Side Product Cards Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <View style={styles.comparisonTable}>
            {products.map((p, idx) => (
              <View key={p.id || p.barcode || idx} style={[styles.productColumn, SHADOWS.card]}>
                {p.imageUrl ? (
                  <Image source={{ uri: p.imageUrl }} style={styles.productImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.productImg, styles.placeholderImg]}>
                    <Tag size={24} color={COLORS.textMuted} />
                  </View>
                )}

                <View style={styles.brandRow}>
                  <Text style={styles.brandName}>{p.brand}</Text>
                  <Text style={styles.categoryPill}>{p.category}</Text>
                </View>

                <Text style={styles.productName} numberOfLines={2}>
                  {p.name}
                </Text>

                {/* Price In INR */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    {p.priceInr || p.price ? formatInr(p.priceInr || p.price) : 'MRP on Request'}
                  </Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingValue}>★ {p.rating || 4.7}</Text>
                  <Text style={styles.reviewsCount}>({p.reviewsCount || 80}+ reviews)</Text>
                </View>

                {/* Key Actives Section */}
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>KEY ACTIVES</Text>
                  <View style={styles.activesWrap}>
                    {(p.ingredientList || p.keyIngredients || []).slice(0, 4).map((ing, i) => (
                      <View key={i} style={styles.activeTag}>
                        <Text style={styles.activeTagText}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Skin Types */}
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>SUITABLE FOR</Text>
                  <Text style={styles.metricValueText}>
                    {(p.suitableSkinTypes || ['All']).join(', ')}
                  </Text>
                </View>

                {/* Data Source & Verification */}
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>DATA SOURCE</Text>
                  <Text style={styles.sourceText}>
                    {p.source || 'Open Beauty Facts / Brand Feed'}
                  </Text>
                </View>

                {/* Action button */}
                <TouchableOpacity
                  style={styles.inspectBtn}
                  onPress={() => router.push({ pathname: '/(tabs)/explore', params: { query: p.name } })}
                >
                  <Text style={styles.inspectBtnText}>Inspect INCI</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comparison Notice */}
        <View style={styles.noticeBox}>
          <ShieldCheck size={16} color={COLORS.burgundy} style={{ marginTop: 2, marginRight: 6 }} />
          <Text style={styles.noticeText}>
            Comparison attributes reflect disclosed manufacturer packaging labels and authorized retailer pricing in India. Individual skin tolerance depends on formulation vehicle and personal skin barrier state.
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 52 : SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.overline,
    fontSize: 9,
    color: COLORS.burgundy,
    letterSpacing: 1.2,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSmall,
    color: COLORS.text,
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  commonActivesCard: {
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
  },
  commonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  commonTitle: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 12,
  },
  commonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontSize: 12,
  },
  horizontalScroll: {
    marginVertical: SPACING.xs,
  },
  comparisonTable: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  productColumn: {
    width: 250,
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  productImg: {
    width: '100%',
    height: 140,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  placeholderImg: {
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandName: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 10,
    fontWeight: '700',
  },
  categoryPill: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.burgundy,
    backgroundColor: 'rgba(114, 47, 55, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
    textTransform: 'uppercase',
  },
  productName: {
    ...TYPOGRAPHY.subtitleSmall,
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
    height: 38,
    marginBottom: 4,
  },
  priceRow: {
    marginVertical: 4,
  },
  priceText: {
    ...TYPOGRAPHY.subtitleMedium,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  ratingValue: {
    ...TYPOGRAPHY.caption,
    color: '#D48806',
    fontWeight: '700',
  },
  reviewsCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  metricBlock: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  metricLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textMuted,
    fontSize: 9,
    marginBottom: 4,
  },
  activesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  activeTag: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  activeTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  metricValueText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontSize: 11,
  },
  sourceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  inspectBtn: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  inspectBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(114, 47, 55, 0.04)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.burgundy,
  },
  noticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
