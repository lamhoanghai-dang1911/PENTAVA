import { useCallback, useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { socialService, type SocialNotification } from '@/src/services/socialService';
import { getNotificationKey } from '@/src/features/home/utils/home-notification-utils';

export function useHomeNotifications() {
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const isLoadingNotificationsRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    let closeStream: (() => void) | null = null;

    void socialService.openNotificationStream(
      () => {
        if (disposed) return;
        Vibration.vibrate([0, 220, 100, 220]);
        setUnreadNotificationCount((count) => count + 1);
        void socialService.getUnreadNotificationCount()
          .then((count) => {
            if (!disposed) setUnreadNotificationCount(count);
          })
          .catch((error: unknown) => {
            if (!disposed) {
              setNotificationError(
                error instanceof Error ? error.message : 'Không thể đồng bộ thông báo.',
              );
            }
          });
      },
      (error) => {
        if (!disposed) setNotificationError(error.message);
      },
    ).then((close) => {
      if (disposed) close();
      else closeStream = close;
    }).catch((error: unknown) => {
      if (!disposed) {
        setNotificationError(
          error instanceof Error ? error.message : 'Không thể kết nối thông báo.',
        );
      }
    });

    return () => {
      disposed = true;
      closeStream?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    void socialService.getUnreadNotificationCount()
      .then((count) => {
        if (isMounted) setUnreadNotificationCount(count);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setNotificationError(
            error instanceof Error ? error.message : 'Không thể tải số thông báo chưa đọc.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (isNotificationsVisible) {
      setIsNotificationsVisible(false);
      return;
    }
    if (isLoadingNotificationsRef.current) return;

    isLoadingNotificationsRef.current = true;
    setNotificationError(null);
    setIsNotificationsVisible(true);
    try {
      const [storedNotifications, unreadCount] = await Promise.all([
        socialService.getAllNotifications(),
        socialService.getUnreadNotificationCount(),
      ]);
      setUnreadNotificationCount(unreadCount);

      const uniqueNotifications = new Map<string, SocialNotification>();
      storedNotifications.forEach((notification) => {
        const key = getNotificationKey(notification);
        if (!uniqueNotifications.has(key)) uniqueNotifications.set(key, notification);
      });

      const sortedNotifications = [...uniqueNotifications.values()].sort(
        (left, right) =>
          new Date(right.createdAt ?? right.timestamp ?? 0).getTime() -
          new Date(left.createdAt ?? left.timestamp ?? 0).getTime(),
      );
      setNotifications(sortedNotifications);
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : 'Không thể kết nối thông báo.',
      );
    } finally {
      isLoadingNotificationsRef.current = false;
    }
  }, [isNotificationsVisible]);

  const markNotificationAsRead = useCallback(async (notification: SocialNotification) => {
    if (notification.id === undefined || notification.read !== false) return;
    try {
      await socialService.markNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ));
      setUnreadNotificationCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : 'Không thể đánh dấu thông báo đã đọc.',
      );
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await socialService.markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      );
      setUnreadNotificationCount(0);
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Không thể đánh dấu tất cả thông báo đã đọc.',
      );
    }
  }, []);

  return {
    isNotificationsVisible,
    setIsNotificationsVisible,
    notifications,
    notificationError,
    unreadNotificationCount,
    toggleNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}
