import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { Sparkles } from 'lucide-react-native';

export const BrandLogo = ({ size = 'medium', light = false, showTagline = true }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const brandColor = light ? COLORS.cream : COLORS.burgundy;
  const tagColor = light ? COLORS.dustyPink : COLORS.textSecondary;

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Sparkles size={isLarge ? 24 : isSmall ? 16 : 20} color={COLORS.dustyPink} style={styles.icon} />
        <Text
          style={[
            styles.title,
            {
              color: brandColor,
              fontSize: isLarge ? 36 : isSmall ? 22 : 28,
              letterSpacing: isLarge ? 6 : 4,
            },
          ]}
        >
          BELLEZZA
        </Text>
      </View>
      {showTagline && (
        <Text
          style={[
            styles.tagline,
            {
              color: tagColor,
              fontSize: isLarge ? 13 : 11,
              letterSpacing: 2,
            },
          ]}
        >
          THE SCIENCE BEHIND YOUR GLOW
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tagline: {
    marginTop: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export default BrandLogo;
