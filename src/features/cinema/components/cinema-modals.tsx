import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type {
  ErrorAlertModalProps,
  PhotoActionModalProps,
  PhotoViewerModalProps,
} from "../types/cinema";

export function ErrorAlertModal({
  visible,
  title,
  message,
  iconName,
  onClose,
}: ErrorAlertModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.errorModal}>
          <View style={styles.errorIcon}>
            <Ionicons color="#B33A3A" name={iconName} size={26} />
          </View>
          <Text style={styles.errorModalTitle}>{title}</Text>
          <Text style={styles.errorModalMessage}>{message}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng thông báo"
            onPress={onClose}
            style={({ pressed }) => [styles.modalButton, pressed && styles.cardPressed]}
          >
            <Text style={styles.modalButtonText}>Đã hiểu</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function PhotoActionModal({
  visible,
  photoId,
  isSelected,
  onView,
  onToggleSelect,
  onClose,
}: PhotoActionModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.photoActionModal}>
          <Text style={styles.errorModalTitle}>Bạn muốn làm gì với ảnh?</Text>
          <Pressable onPress={onView} style={styles.modalOption}>
            <Ionicons color={Design.colors.primaryGreen} name="eye-outline" size={23} />
            <Text style={styles.modalOptionText}>Xem hình ảnh</Text>
          </Pressable>
          <Pressable onPress={onToggleSelect} style={styles.modalOption}>
            <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle-outline" size={23} />
            <Text style={styles.modalOptionText}>
              {photoId !== null && isSelected
                ? "Bỏ chọn hình ảnh"
                : "Chọn hình ảnh"}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Hủy</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function PhotoViewerModal({
  visible,
  photoUrl,
  checkinDate,
  onClose,
}: PhotoViewerModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible && Boolean(photoUrl)}
    >
      <View style={styles.viewerOverlay}>
        <Pressable
          accessibilityLabel="Đóng hình ảnh"
          onPress={onClose}
          style={styles.viewerClose}
        >
          <Ionicons color={Design.colors.white} name="close" size={28} />
        </Pressable>
        {photoUrl ? (
          <Image contentFit="contain" source={photoUrl} style={styles.viewerImage} />
        ) : null}
        {checkinDate ? (
          <Text style={styles.viewerDate}>{formatDate(checkinDate)}</Text>
        ) : null}
      </View>
    </Modal>
  );
}
