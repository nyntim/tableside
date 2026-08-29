import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radii } from '@tableside/shared';
import { useTheme } from '../theme/ThemeProvider';

export function Sparkline({
  values,
  width = 480,
  height = 148,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const { colors } = useTheme();
  if (values.length < 2) return <View style={{ width, height }} />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const step = width / (values.length - 1);
  const points = values.map((value, index) => ({
    x: index * step,
    y: height - ((value - min) / range) * (height - 16) - 8,
  }));

  return (
    <View style={[styles.chart, { width, height, backgroundColor: colors.background }]}>
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1]!;
        const length = Math.hypot(next.x - point.x, next.y - point.y);
        const angle = Math.atan2(next.y - point.y, next.x - point.x);
        return (
          <View
            key={`${point.x}-${point.y}`}
            style={[
              styles.segment,
              {
                backgroundColor: colors.primary,
                width: length,
                left: point.x,
                top: point.y,
                transform: [{ rotateZ: `${angle}rad` }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { overflow: 'hidden', borderRadius: radii.card },
  segment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
});
