import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

export const Badge = ({
  label,
  variant = 'default',
  size = 'small',
  style = {},
  textStyle = {},
}) => {
  const isBurgundy = variant === 'burgundy';
  const isPink = variant === 'pink';
  const isGold = variant === 'gold';
  const isSuccess = variant === 'success';

  const getBackgroundColor = () => {
    if (isBurgundy) return COLORS.burgundy;
    if (isPink) return COLORS.blushPink;
    if (isGold) return COLORS.champagneLight;
    if (isSuccess) return COLORS.successSoft;
    return COLORS.softCream;
  };

  const getTextColor = () => {
    if (isBurgundy) return COLORS.cream;
    if (isPink) return COLORS.burgundy;
    if (isGold) return COLORS.champagneGold;
    if (isSuccess) return COLORS.success;
    return COLORS.textSecondary;
  };

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: isSmall ? 4 : 6,
          paddingHorizontal: isSmall ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: isSmall ? 10 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default Badge;
