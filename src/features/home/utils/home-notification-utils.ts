import type { SocialNotification } from '@/src/services/socialService';

export function getNotificationMessage(notification: SocialNotification): string {
  if (notification.message) return notification.message;

  const actorName = notification.actorName || 'Ai đó';
  switch (notification.eventType) {
    case 'HIGH_FIVE':
      return `${actorName} đã thả High-Five cho bài viết của bạn.`;
    case 'COMMENT':
      return `${actorName} đã bình luận bài viết của bạn.`;
    case 'FRIEND_REQUEST':
      return `${actorName} đã gửi cho bạn lời mời kết bạn.`;
    case 'FRIEND_ACCEPTED':
      return `${actorName} đã đồng ý lời mời kết bạn của bạn.`;
    default:
      return 'Bạn có thông báo mới.';
  }
}

export function getNotificationKey(notification: SocialNotification): string {
  if (notification.id !== undefined && notification.id !== null) {
    return `id-${notification.id}`;
  }

  const identity = [
    notification.eventType ?? '',
    notification.actorId ?? '',
    notification.targetUserId ?? '',
    notification.postId ?? '',
    notification.commentId ?? '',
  ].join('|');

  if (
    notification.eventType ||
    notification.actorId !== undefined ||
    notification.targetUserId !== undefined ||
    notification.postId !== undefined ||
    notification.commentId !== undefined
  ) {
    return identity;
  }

  return `${identity}|${getNotificationMessage(notification)}`;
}
