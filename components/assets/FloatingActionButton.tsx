import MyFAB from '@/components/MyFAB';
import React from 'react';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return <MyFAB onPress={onPress} accessibilityLabel="Create new item" />;
}
