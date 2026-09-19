import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Makes a number climb to its new value instead of jumping.
 * Used for the XP counters. Returns the number to display.
 */
export function useCountUp(value: number, duration = 600): number {
  const animated = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      animated.setValue(value);
      setDisplay(value);
      return;
    }
    const id = animated.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(animated, { toValue: value, duration, useNativeDriver: false }).start(() => {
      setDisplay(value);
    });
    return () => animated.removeListener(id);
  }, [value, duration, animated]);

  return display;
}
