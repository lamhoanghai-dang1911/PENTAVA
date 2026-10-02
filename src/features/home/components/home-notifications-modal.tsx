import { Design } from '@/src/constants/design';
import type { SocialNotification } from '@/src/services/socialService';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotificationKey, getNotificationMessage } from '../utils/home-notifications';
import { styles } from '../home-screen.styles';

type HomeNotificationsModalProps = {
  isVisible: boolean;
  notifications: SocialNotification[];
  notificationError: string | null;
  unreadNotificationCount: number;
  onToggle: () => void;
  onOpenFriendRequests: () => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (notification: SocialNotification) => void;
};

export function HomeNotificationsModal({
  isVisible,
  notifications,
  notificationError,
  unreadNotificationCount,
  onToggle,
  onOpenFriendRequests,
  onMarkAllAsRead,
  onMarkAsRead,
}: HomeNotificationsModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onToggle}
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
      visible={isVisible}>
      <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.notificationModal}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>Thông báo</Text>
          <View style={styles.notificationHeaderActions}>
            <Pressable
              accessibilityLabel="Xem lời mời kết bạn"
              onPress={onOpenFriendRequests}
              style={styles.friendRequestsLink}>
              <Ionicons color={Design.colors.primaryGreen} name="people-outline" size={18} />
              <Text style={styles.friendRequestsLinkText}>Lời mời</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Đánh dấu tất cả thông báo đã đọc"
              disabled={unreadNotificationCount === 0}
              onPress={onMarkAllAsRead}
              style={styles.markAllLink}>
              <Text style={styles.markAllLinkText}>Đã đọc hết</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Đóng thông báo"
              accessibilityRole="button"
              hitSlop={12}
              onPress={onToggle}
              style={styles.notificationCloseButton}>
              <Ionicons color={Design.colors.black} name="close" size={24} />
            </Pressable>
          </View>
        </View>
        {notificationError ? <Text style={styles.notificationError}>{notificationError}</Text> : null}
        {notifications.length === 0 ? (
          <Text style={styles.emptyNotifications}>Đang chờ thông báo mới...</Text>
        ) : (
          <ScrollView>
            {notifications.map((notification) => (
              <Pressable
                key={getNotificationKey(notification)}
                accessibilityRole="button"
                onPress={() => onMarkAsRead(notification)}
                style={styles.notificationItem}>
                <Ionicons color={Design.colors.primaryGreen} name="notifications-outline" size={20} />
                <Text style={[styles.notificationText, notification.read === false && styles.unreadNotificationText]}>
                  {getNotificationMessage(notification)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
