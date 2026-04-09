import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { FREE_LOG_LIMIT } from '@/constants/plans';
import useEntries from '@/hooks/useEntries';
import { useRevenueCat } from '@/hooks/useRevenueCat';

export type LimitStatus = 'none' | 'warning' | 'danger';

export function useFreeLimitReached(): LimitStatus {
  const { isPro } = useRevenueCat();
  const { countEntries } = useEntries();
  const [status, setStatus] = useState<LimitStatus>('none');

  useFocusEffect(
    useCallback(() => {
      if (isPro) {
        setStatus('none');
        return;
      }
      countEntries().then((res) => {
        if (res.success) {
          if (res.data >= FREE_LOG_LIMIT) setStatus('danger');
          else if (res.data === FREE_LOG_LIMIT - 1) setStatus('warning');
          else setStatus('none');
        }
      });
    }, [isPro, countEntries]),
  );

  return status;
}
