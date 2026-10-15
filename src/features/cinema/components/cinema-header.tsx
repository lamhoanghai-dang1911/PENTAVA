import { SectionTabs } from "@/src/components/home/section-tabs";
import { Design } from "@/src/constants/design";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { styles } from "../cinema.styles";
import type { CinemaHeaderProps } from "../types/cinema";

export function CinemaHeader({
  selectedGoal,
  query,
  onQueryChange,
  onBack,
  isNight,
}: CinemaHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={selectedGoal ? "Quay lại danh sách mục tiêu" : "Quay lại"}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons color={isNight ? "#F8FAFC" : Design.colors.black} name="chevron-back" size={28} />
      </Pressable>

      {!selectedGoal && <SectionTabs active="cinema" />}
      <Text style={[styles.title, isNight && { color: "#F8FAFC" }]}>PENTAVA-CINEMA</Text>
      <Text style={[styles.subtitle, isNight && { color: "#94A3B8" }]}>
        {selectedGoal ? "Tiến độ mục tiêu" : "Danh sách mục tiêu của bạn"}
      </Text>

      {!selectedGoal && (
        <View style={[styles.searchBar, isNight && { backgroundColor: "#111C44", borderColor: "#1E293B" }]}>
          <Ionicons color={isNight ? "#94A3B8" : Design.colors.mutedText} name="search-outline" size={16} />
          <TextInput
            accessibilityLabel="Tìm kiếm mục tiêu"
            onChangeText={onQueryChange}
            placeholder="Tìm kiếm mục tiêu"
            placeholderTextColor={isNight ? "#64748B" : Design.colors.disabled}
            style={[styles.searchInput, isNight && { color: "#F8FAFC" }]}
            value={query}
          />
        </View>
      )}
    </View>
  );
}
