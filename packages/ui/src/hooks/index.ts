import { useEffect, useState } from 'react';
import { Dimensions, Platform, useWindowDimensions } from 'react-native';
import { breakpoints } from './tokens';

export function useResponsive() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.md,
  };
}

export function useInteractionState(disabled = false) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const handlers = {
    onHoverIn: () => !disabled && setHovered(true),
    onHoverOut: () => setHovered(false),
    onPressIn: () => !disabled && setPressed(true),
    onPressOut: () => setPressed(false),
    onFocus: () => !disabled && setFocused(true),
    onBlur: () => setFocused(false),
  };

  return { hovered, pressed, focused, handlers, disabled };
}

export function useBreakpointValue<T>(values: { mobile: T; desktop: T }) {
  const { isDesktop } = useResponsive();
  return isDesktop ? values.desktop : values.mobile;
}

export function getInitialWidth() {
  return Platform.OS === 'web' ? Dimensions.get('window').width : 390;
}
