import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceMuted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonGroup({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.group}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} height={index === 0 ? 24 : 16} width={index === 0 ? '60%' : '100%'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  group: {
    gap: 12,
  },
});
