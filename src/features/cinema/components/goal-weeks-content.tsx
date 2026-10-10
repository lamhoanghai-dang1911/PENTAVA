import React from "react";
import { View, Text, ScrollView } from "react-native";
import { WeekCard } from "./week-card";
import { styles } from "../cinema.styles";
import type { GoalWeeksContentProps } from "../types/cinema";

export function GoalWeeksContent({ data, onWeekPress }: GoalWeeksContentProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.weeksContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.weeksGoalName}>{data.goalName}</Text>
      <Text style={styles.goalHint}>
        Mỗi tuần cần tối thiểu {data.minPhotos} ảnh check-in
      </Text>
      <View style={styles.weekStack}>
        {data.weeks.map((week, index) => (
          <WeekCard
            key={week.weekNumber}
            index={index}
            onPress={() => onWeekPress(week)}
            week={week}
          />
        ))}
      </View>
    </ScrollView>
  );
}
