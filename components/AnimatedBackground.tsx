import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

/**
 * Stacks three LinearGradient layers and crossfades between them in a loop,
 * producing a smooth "living colour" effect on dark backgrounds.
 */

const DURATION = 3000; // ms per transition

const DARK_LAYERS: [string, string, string][] = [
  ["#0A0E1A", "#0D2137", "#001A1A"],
  ["#0D1B2A", "#001F1F", "#0A0E1A"],
  ["#071520", "#0A2040", "#002020"],
];

const LIGHT_TINT = Colors.light.tintLight;
const LIGHT_LAYERS: [string, string, string][] = [
  ["#FFFFFF", "#F7FEFF", LIGHT_TINT],
  ["#FFFFFF", LIGHT_TINT, "#F2FDFF"],
  ["#F9FFFF", "#FFFFFF", LIGHT_TINT],
];

interface Props {
  children?: React.ReactNode;
  style?: object;
}

export default function AnimatedBackground({ children, style }: Props) {
  const colorScheme = useColorScheme();
  const layers = colorScheme === "dark" ? DARK_LAYERS : LIGHT_LAYERS;
  const opacities = useRef(
    DARK_LAYERS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;
  const index = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      const next = (index.current + 1) % layers.length;

      Animated.parallel([
        Animated.timing(opacities[index.current], {
          toValue: 0,
          duration: DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacities[next], {
          toValue: 1,
          duration: DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        index.current = next;
        setTimeout(step, DURATION * 0.4);
      });
    };

    setTimeout(step, DURATION * 0.4);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Animated.View style={[styles.container, style]}>
      {layers.map((colors, i) => (
        <Animated.View
          key={i}
          style={[StyleSheet.absoluteFillObject, { opacity: opacities[i] }]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      ))}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
