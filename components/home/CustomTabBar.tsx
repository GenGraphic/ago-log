import Feather from '@expo/vector-icons/Feather';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNotifications } from '@/hooks/useNotifications';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TabItem {
  name: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  isCenter?: boolean;
}

const TABS: TabItem[] = [
  { name: 'index', icon: 'home' },
  { name: 'entries', icon: 'file-text' },
  { name: 'add', icon: 'plus', isCenter: true },
  { name: 'assets', icon: 'briefcase' },
  { name: 'profile', icon: 'user' },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const tint = useThemeColor({}, 'tint');
  const inactive = useThemeColor({}, 'icon');
  const barBg = useThemeColor({}, 'background');
  const { unreadCount } = useNotifications();

  return (
    <View style={[styles.wrapper, { shadowColor: tint }]}>
      <View style={[styles.container, { backgroundColor: barBg, borderColor: `${tint}40` }]}>
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const tab = TABS[index];
            if (!tab) return null;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            if (tab.isCenter) {
              return (
                <View key={route.key} style={styles.centerTabContainer}>
                  <TouchableOpacity
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={[styles.centerTab, { backgroundColor: tint, shadowColor: tint }]}
                    activeOpacity={0.8}>
                    <Feather name="plus" size={28} color={barBg} />
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
                activeOpacity={0.7}>
                {isFocused && <View style={[styles.iconGlow, { backgroundColor: `${tint}1F`, shadowColor: tint }]} />}
                <Feather
                  name={tab.icon}
                  size={24}
                  color={isFocused ? tint : inactive}
                />
                {/* Notification badge removed from tab bar */}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  container: {
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 8,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  iconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6060',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
