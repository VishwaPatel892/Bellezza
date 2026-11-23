import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon: IconComponent = null,
  style = {},
  textStyle = {},
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isAccent = variant === 'accent';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const getBackgroundColor = () => {
    if (disabled) return '#DFD7D0';
    if (isPrimary) return COLORS.burgundy;
    if (isAccent) return COLORS.dustyPink;
    if (isSecondary) return COLORS.surfaceCard;
    if (isOutline || isGhost) return 'transparent';
    return COLORS.burgundy;
  };

  const getTextColor = () => {
    if (disabled) return '#8E827D';
    if (isPrimary) return COLORS.cream;
    if (isAccent) return COLORS.burgundy;
    if (isSecondary || isOutline || isGhost) return COLORS.burgundy;
    return COLORS.cream;
  };

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isOutline ? COLORS.burgundy : isSecondary ? COLORS.border : 'transparent',
          borderWidth: isOutline || isSecondary ? 1.5 : 0,
          paddingVertical: isSmall ? 10 : isLarge ? 16 : 14,
          paddingHorizontal: isSmall ? 16 : isLarge ? 28 : 20,
        },
        isPrimary && !disabled ? SHADOWS.subtle : {},
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {IconComponent && <View style={styles.iconWrapper}>{IconComponent}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: isSmall ? 13 : isLarge ? 16 : 14,
                letterSpacing: 1.2,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default Button;
