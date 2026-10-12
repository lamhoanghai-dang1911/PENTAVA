import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Design, FontFamily } from "@/src/constants/design";
import { cinemaService } from "@/src/services/cinemaService";
import type { PhotoItem, Clip } from "@/src/types/api/cinema";
import { getErrorMessage } from "../utils/cinema-utils";
import { NoticeModal } from "./cinema-modals";

type JourneyPhotoItem = PhotoItem & { weekNumber: number };

type JourneyClipModalProps = {
  visible: boolean;
  goalId: number;
  goalName: string;
  onClose: () => void;
  onSuccess: (clip: Clip) => void;
};

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 48 - 16) / COLUMN_COUNT;

export function JourneyClipModal({
  visible,
  goalId,
  goalName,
  onClose,
  onSuccess,
}: JourneyClipModalProps) {
  const [photos, setPhotos] = useState<JourneyPhotoItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal alert state for clean UI messaging
  const [modalAlert, setModalAlert] = useState<{
    visible: boolean;
    type: "error" | "success" | "warning";
    title: string;
    message: string;
    onAction?: () => void;
    actionText?: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    setIsLoading(true);
    setSelectedIds(new Set());
    setModalAlert(null);

    Promise.allSettled([
      cinemaService.getGoalWeekPhotos(goalId, 1),
      cinemaService.getGoalWeekPhotos(goalId, 2),
      cinemaService.getGoalWeekPhotos(goalId, 3),
      cinemaService.getGoalWeekPhotos(goalId, 4),
    ]).then((results) => {
      if (!isMounted) return;
      const allPhotos: JourneyPhotoItem[] = [];
      results.forEach((res, idx) => {
        if (res.status === "fulfilled" && res.value?.photos) {
          res.value.photos.forEach((photo) => {
            allPhotos.push({
              ...photo,
              weekNumber: idx + 1,
            });
          });
        }
      });
      setPhotos(allPhotos);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [visible, goalId]);

  const toggleSelect = (photoId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        if (next.size >= 20) {
          setModalAlert({
            visible: true,
            type: "warning",
            title: "Giới hạn số lượng ảnh",
            message: "Bạn chỉ có thể chọn tối đa 20 ảnh cho một video hành trình.",
          });
          return prev;
        }
        next.add(photoId);
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (selectedIds.size < 3) {
      setModalAlert({
        visible: true,
        type: "warning",
        title: "Cần thêm ảnh",
        message: "Vui lòng chọn tối thiểu 3 ảnh từ các tuần để ghép thành video hành trình.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const createdClip = await cinemaService.createJourneyClip(
        goalId,
        Array.from(selectedIds),
      );

      setModalAlert({
        visible: true,
        type: "success",
        title: "Khởi tạo thành công! 🎉",
        message:
          "Clip hành trình Multi-Angle đang được hệ thống render trong nền. Bạn có muốn xem danh sách video ngay không?",
        actionText: "Xem Clip Đã Ghép",
        onAction: () => {
          setModalAlert(null);
          onSuccess(createdClip);
        },
      });
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setModalAlert({
        visible: true,
        type: "error",
        title: "Không thể tạo video",
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Pressable onPress={onClose} style={modalStyles.closeButton}>
            <Ionicons name="close" size={24} color={Design.colors.black} />
          </Pressable>
          <View style={modalStyles.headerTextContainer}>
            <Text style={modalStyles.title}>Clip Hành Trình Đa Tuần 🎬</Text>
            <Text style={modalStyles.subtitle} numberOfLines={1}>
              {goalName}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={modalStyles.infoBanner}>
          <Ionicons name="sparkles" size={18} color="#D97706" />
          <Text style={modalStyles.infoBannerText}>
            Chọn từ 3 đến 20 ảnh check-in xuyên suốt 4 tuần để tạo video tổng kết hành trình (Multi-Angle).
          </Text>
        </View>

        {isLoading ? (
          <View style={modalStyles.centerContainer}>
            <ActivityIndicator size="large" color={Design.colors.primaryGreen} />
            <Text style={modalStyles.loadingText}>Đang tải ảnh 4 tuần...</Text>
          </View>
        ) : photos.length === 0 ? (
          <View style={modalStyles.centerContainer}>
            <Ionicons name="images-outline" size={48} color={Design.colors.disabled} />
            <Text style={modalStyles.emptyTitle}>Chưa có ảnh check-in nào</Text>
            <Text style={modalStyles.emptySubtitle}>
              Bạn cần hoàn thành check-in các tuần để có ảnh ghép video.
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={modalStyles.photoGrid}
            data={photos}
            keyExtractor={(item) => String(item.photoId)}
            numColumns={COLUMN_COUNT}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.photoId);
              return (
                <Pressable
                  onPress={() => toggleSelect(item.photoId)}
                  style={[
                    modalStyles.photoItem,
                    isSelected && modalStyles.photoItemSelected,
                  ]}
                >
                  <Image source={{ uri: item.imageUrl }} style={modalStyles.photoImage} />
                  <View style={modalStyles.weekBadge}>
                    <Text style={modalStyles.weekBadgeText}>T{item.weekNumber}</Text>
                  </View>
                  <View
                    style={[
                      modalStyles.selectCircle,
                      isSelected && modalStyles.selectCircleActive,
                    ]}
                  >
                    {isSelected ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        <View style={modalStyles.footer}>
          <View style={modalStyles.counterContainer}>
            <Text style={modalStyles.counterText}>
              Đã chọn: <Text style={modalStyles.counterHighlight}>{selectedIds.size}</Text>/20 ảnh
            </Text>
            {selectedIds.size > 0 && selectedIds.size < 3 ? (
              <Text style={modalStyles.warningHint}>Cần tối thiểu 3 ảnh</Text>
            ) : null}
          </View>

          <Pressable
            disabled={selectedIds.size < 3 || isSubmitting}
            onPress={() => void handleCreate()}
            style={[
              modalStyles.submitButton,
              (selectedIds.size < 3 || isSubmitting) && modalStyles.submitButtonDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="videocam" size={20} color="#FFFFFF" />
                <Text style={modalStyles.submitButtonText}>Tạo Clip Hành Trình</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Modal Alert for all responses & errors */}
        {modalAlert && (
          <NoticeModal
            actionButtonText={modalAlert.actionText}
            buttonText={modalAlert.type === "success" ? "Đóng" : "Đã hiểu"}
            iconColor={
              modalAlert.type === "error"
                ? "#B33A3A"
                : modalAlert.type === "warning"
                ? "#D97706"
                : Design.colors.primaryGreen
            }
            iconName={
              modalAlert.type === "error"
                ? "alert-circle-outline"
                : modalAlert.type === "warning"
                ? "warning-outline"
                : "checkmark-circle-outline"
            }
            message={modalAlert.message}
            onAction={modalAlert.onAction}
            onClose={() => {
              const wasSuccess = modalAlert.type === "success";
              setModalAlert(null);
              if (wasSuccess) {
                onClose();
              }
            }}
            title={modalAlert.title}
            visible={modalAlert.visible}
          />
        )}
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Design.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#92400E",
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    textAlign: "center",
    marginTop: 4,
  },
  photoGrid: {
    padding: 16,
    gap: 8,
  },
  photoItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.25,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#F3F4F6",
  },
  photoItemSelected: {
    borderColor: Design.colors.primaryGreen,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  weekBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  weekBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  selectCircle: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectCircleActive: {
    backgroundColor: Design.colors.primaryGreen,
    borderColor: "#FFFFFF",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: Design.colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterContainer: {
    flex: 1,
  },
  counterText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.black,
  },
  counterHighlight: {
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.primaryGreen,
  },
  warningHint: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#B33A3A",
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: Design.colors.primaryGreen,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
});
