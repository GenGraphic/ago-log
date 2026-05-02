import { markOnboardingSeen } from "@/helpers/onboardingStorage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";
import MyMainButton from "@/components/MyMainButton";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "🔐",
    titleKey: "onboarding.slide1Title",
    descriptionKey: "onboarding.slide1Desc",
  },
  {
    id: "2",
    icon: "⏰",
    titleKey: "onboarding.slide2Title",
    descriptionKey: "onboarding.slide2Desc",
  },
  {
    id: "3",
    icon: "🔔",
    titleKey: "onboarding.slide3Title",
    descriptionKey: "onboarding.slide3Desc",
  },
  {
    id: "4",
    icon: "🚀",
    titleKey: "onboarding.slide4Title",
    descriptionKey: "onboarding.slide4Desc",
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? "dark"].tint;
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const finish = async () => {
    await markOnboardingSeen();
    router.replace("/(auth)");
  };

  const skip = async () => {
    await markOnboardingSeen();
    router.replace("/(auth)");
  };

  return (
    <AnimatedBackground style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        {/* Skip button */}
        {!isLast && (
          <View style={styles.skipRow}>
            <TouchableOpacity onPress={skip} activeOpacity={0.7}>
              <ThemedText style={styles.skipText}>{t('onboarding.skip')}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item, index }) => (
            <View style={styles.slide}>
              {index === 0 ? (
                <Logo />
              ) : (
                <ThemedText style={styles.icon}>{item.icon}</ThemedText>
              )}
              <ThemedText type="title" style={styles.title}>
                {t(item.titleKey as any)}
              </ThemedText>
              <ThemedText type="default" style={styles.description}>
                {t(item.descriptionKey as any)}
              </ThemedText>
            </View>
          )}
        />

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? tint : "#444",
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Legal links */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
            By using this app, you agree to our{' '}
            <Text style={{ textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://ago-log.com/privacy-policy')}>Privacy Policy</Text>
            {' '}and{' '}
            <Text style={{ textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://ago-log.com/terms-of-service')}>Terms of Service</Text>.
          </ThemedText>
        </View>

        {/* Action button */}
        <View style={styles.buttonContainer}>
          {isLast ? (
            <MyMainButton
              title={t('onboarding.getStarted')}
              isDisabled={false}
              action={finish}
            />
          ) : (
            <MyMainButton
              title={t('onboarding.next')}
              isDisabled={false}
              action={goNext}
            />
          )}
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  skipRow: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  skipText: {
    fontSize: 15,
    opacity: 0.6,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
  },
  icon: {
    fontSize: 72,
    lineHeight: 96,
    textAlign: "center",
  },
  title: {
    textAlign: "center",
    marginTop: 8,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
});
