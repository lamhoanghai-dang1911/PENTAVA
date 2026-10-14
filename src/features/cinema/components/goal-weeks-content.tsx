import { FontFamily } from "@/src/constants/design";
import { useAppTheme } from "@/src/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../cinema.styles";
import type { GoalWeeksContentProps } from "../types/cinema";
import { WeekCard } from "./week-card";

export function GoalWeeksContent({
  data,
  onWeekPress,
  onJourneyClipPress,
  onViewJourneyClipsPress,
  isMultiAngleUnlocked = true,
}: GoalWeeksContentProps) {
  const { isNight } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.weeksContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.weeksGoalName, isNight && { color: "#FFFFFF" }]}>
        {data.goalName}
      </Text>
      <Text style={[styles.goalHint, isNight && { color: "#94A3B8" }]}>
        Mỗi tuần cần tối thiểu {data.minPhotos} ảnh check-in
      </Text>

      {/* VIP Multi-Angle Journey Card */}
      {onJourneyClipPress && (
        <View style={localStyles.journeyBanner}>
          <View style={localStyles.journeyTextContainer}>
            <View style={localStyles.badgeRow}>
              <Text style={localStyles.journeyTitle}>
                CLIP HÀNH TRÌNH
              </Text>
              <View style={[localStyles.vipBadge, !isMultiAngleUnlocked && { backgroundColor: '#FBBF24', flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                {!isMultiAngleUnlocked ? (
                  <Ionicons name="lock-closed" size={10} color="#78350F" />
                ) : null}
                <Text style={[localStyles.vipText, !isMultiAngleUnlocked && { color: '#78350F' }]}>
                  {isMultiAngleUnlocked ? "VIP" : "KHÓA VIP"}
                </Text>
              </View>
            </View>
            <Text style={localStyles.journeySubtitle}>
              Tạo và xem lại các video tổng kết kết hợp ảnh check-in từ các tuần (Multi-Angle)
            </Text>
          </View>

          <View style={localStyles.buttonGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onJourneyClipPress}
              style={localStyles.createBtn}
            >
              <Ionicons name="film-outline" size={15} color="#FFFFFF" />
              <Text style={localStyles.createBtnText}>Tạo Clip Mới</Text>
            </TouchableOpacity>

            {onViewJourneyClipsPress && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onViewJourneyClipsPress}
                style={localStyles.viewBtn}
              >
                <Ionicons name="play-circle-outline" size={16} color="#B45309" />
                <Text style={localStyles.viewBtnText}>Xem Clip Đã Ghép</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* 4 Weeks Stack */}
      <View style={styles.weekStack}>
        {data.weeks.map((week, index) => (
          <WeekCard
            key={week.weekNumber}
            index={index}
            minPhotos={data.minPhotos}
            onPress={() => onWeekPress(week)}
            week={week}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  journeyBanner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
    borderWidth: 1.5,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  journeyTextContainer: {
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  journeyTitle: {
    fontSize: 15,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#78350F",
  },
  vipBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  vipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  journeySubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#92400E",
    marginTop: 3,
    lineHeight: 17,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
  },
  createBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#D97706",
    paddingVertical: 10,
    borderRadius: 12,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
  viewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FDE68A",
    borderColor: "#F59E0B",
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewBtnText: {
    color: "#92400E",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
});
