import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SectionTabs } from "@/src/components/home/section-tabs";
import { Design } from "@/src/constants/design";
import { styles } from "../cinema.styles";
import type { CinemaHeaderProps } from "../types/cinema";

export function CinemaHeader({
  selectedGoal,
  query,
  onQueryChange,
  onBack,
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
        <Ionicons color={Design.colors.black} name="chevron-back" size={28} />
      </Pressable>

      {!selectedGoal && <SectionTabs active="cinema" />}
      <Text style={styles.title}>PENTAVA-CINEMA</Text>
      <Text style={styles.subtitle}>
        {selectedGoal ? "Tiến độ mục tiêu" : "Danh sách mục tiêu của bạn"}
      </Text>

      {!selectedGoal && (
        <View style={styles.searchBar}>
          <Ionicons color={Design.colors.mutedText} name="search-outline" size={16} />
          <TextInput
            accessibilityLabel="Tìm kiếm mục tiêu"
            onChangeText={onQueryChange}
            placeholder="Tìm kiếm mục tiêu"
            placeholderTextColor={Design.colors.disabled}
            style={styles.searchInput}
            value={query}
          />
        </View>
      )}
    </View>
  );
}
