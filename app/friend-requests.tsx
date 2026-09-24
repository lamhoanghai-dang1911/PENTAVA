import { Design, FontFamily } from "@/src/constants/design";
import { socialService } from "@/src/services/socialService";
import type { FriendRequest } from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Không thể tải lời mời kết bạn.";
}

export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void socialService.getFriendRequests()
      .then(setRequests)
      .catch((error) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAccept = async (request: FriendRequest) => {
    setProcessingId(request.id);
    try {
      await socialService.acceptFriendRequest(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: FriendRequest) => {
    setProcessingId(request.id);
    try {
      await socialService.rejectFriendRequest(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Quay lại" onPress={() => router.back()}>
          <Ionicons color={Design.colors.black} name="chevron-back" size={25} />
        </Pressable>
        <Text style={styles.title}>Lời mời kết bạn</Text>
        <View style={styles.headerSpacer} />
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Ionicons color={Design.colors.mutedText} name="people-outline" size={48} />
          <Text style={styles.emptyText}>Không có lời mời kết bạn nào.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {requests.map((request) => {
            const name = request.friendName.trim() || request.friendEmail.split("@")[0] || "Thành viên";
            const initial = name.charAt(0).toUpperCase();
            const isProcessing = processingId === request.id;
            return (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.avatar}>
                  {request.friendAvatar ? (
                    <Image contentFit="cover" source={{ uri: request.friendAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{initial}</Text>
                  )}
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.email}>{request.friendEmail}</Text>
                  <Text style={styles.date}>Đã gửi {formatDate(request.createdAt)}</Text>
                  <View style={styles.actions}>
                    <Pressable
                      disabled={isProcessing}
                      onPress={() => void handleAccept(request)}
                      style={styles.acceptButton}>
                      <Text style={styles.acceptText}>{isProcessing ? "Đang xử lý..." : "Chấp nhận"}</Text>
                    </Pressable>
                    <Pressable
                      disabled={isProcessing}
                      onPress={() => void handleReject(request)}
                      style={styles.rejectButton}>
                      <Text style={styles.rejectText}>Từ chối</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
      <Modal transparent visible={errorMessage !== null} onRequestClose={() => setErrorMessage(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons color="#B33A3A" name="alert-circle-outline" size={42} />
            <Text style={styles.modalTitle}>Không thể thực hiện</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <Pressable onPress={() => setErrorMessage(null)} style={styles.closeButton}>
              <Text style={styles.closeText}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "mới đây"
    : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Design.colors.white, flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 12 },
  headerSpacer: { width: 25 },
  title: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body },
  content: { gap: 12, padding: 20 },
  center: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  emptyText: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.body, marginTop: 12 },
  requestCard: { borderColor: "#E9E9E9", borderRadius: 16, borderWidth: 1, flexDirection: "row", padding: 14 },
  avatar: { alignItems: "center", backgroundColor: "#F5D6DE", borderRadius: 28, height: 56, justifyContent: "center", overflow: "hidden", width: 56 },
  avatarImage: { height: "100%", width: "100%" },
  avatarText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: 22 },
  requestInfo: { flex: 1, marginLeft: 12 },
  name: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body },
  email: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption },
  date: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption - 1, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  acceptButton: { backgroundColor: Design.colors.primaryGreen, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  acceptText: { color: Design.colors.white, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption },
  rejectButton: { borderColor: "#D9D9D9", borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  rejectText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption },
  modalOverlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,.45)", flex: 1, justifyContent: "center", padding: 24 },
  modalCard: { alignItems: "center", backgroundColor: Design.colors.white, borderRadius: 20, padding: 24, width: "100%" },
  modalTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body, marginTop: 10 },
  modalMessage: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 8, textAlign: "center" },
  closeButton: { backgroundColor: Design.colors.primaryGreen, borderRadius: 20, marginTop: 18, paddingHorizontal: 26, paddingVertical: 10 },
  closeText: { color: Design.colors.white, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
});
