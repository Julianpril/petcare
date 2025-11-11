import { useCallback, useState } from 'react';
import type { ToastProps } from '../components/ToastNotification';

type ToastType = NonNullable<ToastProps['type']>;

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

const DEFAULT_DURATION = 3000;

export function useToast(defaultDuration: number = DEFAULT_DURATION) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
    duration: defaultDuration,
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration?: number) => {
      setToast({
        visible: true,
        message,
        type,
        duration: duration ?? defaultDuration,
      });
    },
    [defaultDuration]
  );

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
