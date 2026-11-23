import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Bookmark, Sparkles } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { formatInr } from '../../utils/formatters';

export function ProductCard({ product, isSaved = false, onToggleSave, onPress, style }) {
  if (!product) return null;

  const displayPrice = product.priceFormatted || (product.priceInr ? formatInr(product.priceInr) : (product.price ? formatInr(product.price) : null));
  const tagText = product.isIndianOrigin ? 'India Edition' : (product.brand?.includes('Minimalist') || product.brand?.includes('Derma Co') ? 'Popular in India' : (product.source ? 'Verified' : 'Clinical'));

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, SHADOWS.subtle, style]}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View style={styles.imagePlaceholder}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.botanicalGraphic}>
            <Sparkles size={24} color={COLORS.dustyPink} />
          </View>
        )}
        <TouchableOpacity
          onPress={() => onToggleSave && onToggleSave(product.id || product._id)}
          style={styles.saveBtn}
          accessibilityLabel="Save product"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bookmark
            size={16}
            color={isSaved ? COLORS.burgundy : COLORS.textMuted}
            fill={isSaved ? COLORS.burgundy : 'transparent'}
          />
        </TouchableOpacity>
        <View style={styles.sampleTag}>
          <Text style={styles.sampleText}>{tagText}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{product.category?.toUpperCase() || 'CARE'}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brand}>{product.brand || 'Bellezza Lab'}</Text>

        <View style={styles.footer}>
          {displayPrice ? (
            <Text style={styles.price}>{displayPrice}</Text>
          ) : (
            <Text style={styles.price}>Clinical</Text>
          )}
          {product.rating ? (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {product.rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    width: 200,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  botanicalGraphic: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  saveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleTag: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(78, 32, 39, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  sampleText: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.cream,
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.sm + 2,
  },
  category: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    marginBottom: 2,
  },
  name: {
    ...TYPOGRAPHY.headingSmall,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textPrimary,
    marginBottom: 2,
    minHeight: 36,
  },
  brand: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    ...TYPOGRAPHY.headingSmall,
    fontSize: 13,
    color: COLORS.burgundy,
  },
  ratingBadge: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});

