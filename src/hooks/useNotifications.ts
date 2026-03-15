import { useState, useCallback } from 'react';

const STORAGE_KEY = 'weather_notifications_optin';

const isSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export interface UseNotificationsResult {
  supported: boolean;
  permission: NotificationPermission | null;
  optedIn: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

export function useNotifications(): UseNotificationsResult {
  const supported = isSupported();

  const [permission, setPermission] = useState<NotificationPermission | null>(
    supported ? Notification.permission : null
  );

  const [optedIn, setOptedIn] = useState<boolean>(() => {
    if (!supported) return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const requestPermission = useCallback(async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    const granted = result === 'granted';
    localStorage.setItem(STORAGE_KEY, String(granted));
    setOptedIn(granted);
  }, [supported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!supported || !optedIn || Notification.permission !== 'granted') return;
      new Notification(title, options);
    },
    [supported, optedIn]
  );

  return { supported, permission, optedIn, requestPermission, sendNotification };
}
