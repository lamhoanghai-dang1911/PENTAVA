import { Design, FontFamily } from "@/src/constants/design";
import { cinemaService } from "@/src/services/cinemaService";
import type { PrivacyMode } from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIVACY_OPTIONS: { value: PrivacyMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "PUBLIC", label: "Công khai", icon: "globe-outline" },
  { value: "FRIENDS_ONLY", label: "Bạn bè", icon: "people-outline" },
  { value: "PRIVATE", label: "Riêng tư", icon: "lock-closed-outline" },
];

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error.response as {
      data?: { message?: string; error?: string };
    } | undefined)?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }
  return error instanceof Error ? error.message : "Không thể đăng video lên PENTAVA social.";
}

export default function SocialPostScreen() {
  const { clipId: clipIdParam, videoUrl: videoUrlParam } =
    useLocalSearchParams<{ clipId?: string; videoUrl?: string }>();
  const clipId = Number(clipIdParam);
  const videoUrl = typeof videoUrlParam === "string" ? videoUrlParam : "";
  const player = useVideoPlayer(videoUrl, (videoPlayer) => {
    videoPlayer.loop = false;
  });
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const handleSubmit = async () => {
    if (!Number.isInteger(clipId) || clipId <= 0 || !videoUrl) {
      setErrorMessage("Không tìm thấy video hợp lệ để đăng.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await cinemaService.createSocialPost({
        clipId,
        caption: caption.trim(),
        tags: tags.trim(),
        privacyMode,
      });
      setIsSuccessVisible(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}>
            <Ionicons color={Design.colors.black} name="chevron-back" size={25} />
          </Pressable>
          <Text style={styles.headerTitle}>Đăng lên PENTAVA social</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Xem trước video</Text>
          <VideoView
            contentFit="contain"
            fullscreenOptions={{ enable: true }}
            nativeControls
            player={player}
            style={styles.video}
          />

          <Text style={styles.sectionTitle}>Caption</Text>
          <TextInput
            multiline
            onChangeText={setCaption}
            placeholder="Bạn muốn chia sẻ điều gì về video này?"
            placeholderTextColor={Design.colors.disabled}
            style={[styles.input, styles.captionInput]}
            textAlignVertical="top"
            value={caption}
          />

          <Text style={styles.sectionTitle}>Tag</Text>
          <TextInput
            onChangeText={setTags}
            placeholder="#pentava #hanhtrinhcuatoi"
            placeholderTextColor={Design.colors.disabled}
            style={styles.input}
            value={tags}
          />

          <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
          <View style={styles.privacyList}>
            {PRIVACY_OPTIONS.map((option) => {
              const isSelected = privacyMode === option.value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  key={option.value}
                  onPress={() => setPrivacyMode(option.value)}
                  style={[styles.privacyOption, isSelected && styles.privacyOptionSelected]}>
                  <Ionicons
                    color={isSelected ? Design.colors.primaryGreen : Design.colors.mutedText}
                    name={option.icon}
                    size={21}
                  />
                  <Text style={[styles.privacyLabel, isSelected && styles.privacyLabelSelected]}>
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons
                      color={Design.colors.primaryGreen}
                      name="checkmark-circle"
                      size={21}
                      style={styles.privacyCheck}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.disabledButton,
              pressed && styles.cardPressed,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={Design.colors.white} />
            ) : (
              <>
                <Ionicons color={Design.colors.white} name="paper-plane-outline" size={19} />
                <Text style={styles.submitButtonText}>Đăng</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        onRequestClose={() => setErrorMessage(null)}
        transparent
        visible={errorMessage !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.errorIcon}>
              <Ionicons color="#B33A3A" name="alert-circle-outline" size={28} />
            </View>
            <Text style={styles.modalTitle}>Không thể đăng video</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <Pressable onPress={() => setErrorMessage(null)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Đã hiểu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsSuccessVisible(false)}
        transparent
        visible={isSuccessVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Ionicons color={Design.colors.primaryGreen} name="checkmark" size={30} />
            </View>
            <Text style={styles.modalTitle}>Đăng video thành công</Text>
            <Text style={styles.modalMessage}>Video của bạn đã được đăng lên PENTAVA social.</Text>
            <Pressable
              onPress={() => router.replace("/community")}
              style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Đến PENTAVA social</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Design.colors.white, flex: 1 },
  flex: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  headerTitle: {
    color: Design.colors.black,
    flex: 1,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    textAlign: "center",
  },
  headerSpacer: { width: 25 },
  content: { padding: 24, paddingBottom: 36 },
  sectionTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    marginBottom: 10,
    marginTop: 16,
  },
  video: { backgroundColor: "#111111", borderRadius: 16, height: 220, width: "100%" },
  input: {
    borderColor: "#E2E2E2",
    borderRadius: 12,
    borderWidth: 1,
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  captionInput: { height: 110 },
  privacyList: { gap: 10 },
  privacyOption: {
    alignItems: "center",
    borderColor: "#E2E2E2",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    padding: 14,
  },
  privacyOptionSelected: {
    backgroundColor: "#F1F8F3",
    borderColor: Design.colors.primaryGreen,
  },
  privacyLabel: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    marginLeft: 10,
  },
  privacyLabelSelected: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  privacyCheck: { marginLeft: "auto" },
  submitButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 26,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 52,
  },
  submitButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  disabledButton: { opacity: 0.55 },
  cardPressed: { opacity: 0.8 },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderRadius: 22,
    maxWidth: 380,
    padding: 26,
    width: "100%",
  },
  errorIcon: {
    alignItems: "center",
    backgroundColor: "#FDEAEA",
    borderRadius: 30,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  successIcon: {
    alignItems: "center",
    backgroundColor: "#EAF3ED",
    borderRadius: 30,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  modalTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    marginTop: 14,
    textAlign: "center",
  },
  modalMessage: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  modalButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 22,
    marginTop: 22,
    minWidth: 140,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  modalButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
});
