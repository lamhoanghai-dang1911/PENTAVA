import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../community.styles";
import type { DeleteCommentModalProps, ErrorModalProps } from "../types/community";

export function ErrorModal({
  visible,
  errorMessage,
  onClose,
  onRetry,
}: ErrorModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.errorIcon}>
            <Ionicons color="#B33A3A" name="alert-circle-outline" size={28} />
          </View>
          <Text style={styles.modalTitle}>Không thể thực hiện thao tác</Text>
          <Text style={styles.modalMessage}>{errorMessage}</Text>
          <Pressable onPress={onRetry} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function DeleteCommentModal({
  visible,
  onCancel,
  onConfirm,
}: DeleteCommentModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.warningIcon}>
            <Ionicons color="#B33A3A" name="trash-outline" size={28} />
          </View>
          <Text style={styles.modalTitle}>Xóa bình luận?</Text>
          <Text style={styles.modalMessage}>
            Bạn có chắc chắn muốn xóa bình luận này không? Thao tác này không thể hoàn tác.
          </Text>
          <View style={styles.confirmActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={styles.deleteButton}
            >
              <Text style={styles.modalButtonText}>Xóa</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
