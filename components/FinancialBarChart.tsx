import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Types for entries
type Entry = {
  expiryDate?: string;
  currentPrice?: number;
  title?: string;
};

type Props = {
  entries: Entry[];
};

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const BAR_WIDTH = 18;
const CHART_HEIGHT = 80;
const CHART_PADDING = 12;

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentYearMonths(): { key: string; label: string }[] {
  const now = new Date();
  const year = now.getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    return {
      key: getMonthKey(d),
      label: MONTHS[i],
    };
  });
}

export const FinancialBarChart: React.FC<Props> = ({ entries }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const barColor = useThemeColor({}, 'tint');
  const barEmptyColor = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  // 1. Filter entries with currentPrice and expiryDate
  const filtered = entries.filter(e => typeof e.currentPrice === 'number' && !!e.expiryDate);

  // 2. Group by month (YYYY-MM) and collect entries per month
  const monthMap: Record<string, number> = {};
  const monthEntries: Record<string, Entry[]> = {};
  filtered.forEach(e => {
    if (!e.expiryDate) return;
    const d = new Date(e.expiryDate);
    // Only count entries expiring in the current year
    if (d.getFullYear() !== new Date().getFullYear()) return;
    const key = getMonthKey(d);
    monthMap[key] = (monthMap[key] || 0) + (e.currentPrice || 0);
    if (!monthEntries[key]) monthEntries[key] = [];
    monthEntries[key].push(e);
  });

  // Always show Jan-Dec of current year
  const months = getCurrentYearMonths();
  const data = months.map(m => monthMap[m.key] || 0);
  const max = Math.max(...data, 1);
  const total = data.reduce((a, b) => a + b, 0);

  // Bubble rendering
  const renderBubble = () => {
    if (selectedMonth == null) return null;
    const monthKey = months[selectedMonth].key;
    const entriesForMonth = monthEntries[monthKey] || [];
    if (!entriesForMonth.length) return null;
    const totalForMonth = data[selectedMonth];
    // Bubble position: above the bar, horizontally centered, but clamped to chart width
    const chartWidth = BAR_WIDTH * 12 + 16; // 12 bars + padding
    const bubbleWidth = 200; // maxWidth from styles.bubble
    let barX = (BAR_WIDTH * selectedMonth) + BAR_WIDTH / 2 + 8; // 8px left padding
    let left = barX - bubbleWidth / 2;
    if (left < 0) left = 0;
    if (left + bubbleWidth > chartWidth) left = chartWidth - bubbleWidth;
    return (
      <View style={[styles.bubble, { left, top: 0, backgroundColor: backgroundColor, borderColor: barColor }]}> 
        <Text style={[styles.bubbleTitle, { color: textColor }]}>Total: {totalForMonth.toLocaleString(undefined, { style: 'currency', currency: 'RON' })}</Text>
        {entriesForMonth.map((e, idx) => (
          <Text key={idx} style={[styles.bubbleItem, { color: textColor }]}>• {e.title || 'Untitled'}: {e.currentPrice?.toLocaleString(undefined, { style: 'currency', currency: 'RON' })}</Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <Text style={[styles.totalText, { color: textColor }]}>Total: {total.toLocaleString(undefined, { style: 'currency', currency: 'RON' })}</Text>
      <View style={styles.chart}>
        {/* Overlay to close bubble when pressing outside bars */}
        {/* Overlay removed for long press UX */}
        {data.map((value, i) => (
          <Pressable
            key={months[i].key}
            style={styles.barContainer}
            onLongPress={e => {
              e.stopPropagation && e.stopPropagation();
              setSelectedMonth(i);
            }}
            onPressOut={() => setSelectedMonth(null)}
            delayLongPress={200}
            hitSlop={8}
          >
            <View
              style={[
                styles.bar,
                {
                  height: (value / max) * CHART_HEIGHT,
                  backgroundColor: value > 0 ? barColor : barEmptyColor,
                },
              ]}
            />
            <Text style={[styles.label, { color: textColor }]}>{months[i].label}</Text>
          </Pressable>
        ))}
        {renderBubble()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: CHART_PADDING,
    borderRadius: 12,
    elevation: 2,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 20,
    marginTop: 8,
  },
  barContainer: {
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  bar: {
    width: BAR_WIDTH - 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  bubble: {
    position: 'absolute',
    minWidth: 120,
    maxWidth: 200,
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    zIndex: 10,
    top: -60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bubbleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 13,
  },
  bubbleItem: {
    fontSize: 12,
    marginBottom: 2,
  },
});

export default FinancialBarChart;
