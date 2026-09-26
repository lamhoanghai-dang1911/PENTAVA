import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedTogglePill, ToggleTab } from './animated-toggle-pill';

type SectionTabsProps = {
  active: ToggleTab;
};

export function SectionTabs({ active }: SectionTabsProps) {
  return (
    <View style={styles.container}>
      <AnimatedTogglePill
        activeTab={active}
        onSelectCinema={() => router.replace('/cinema')}
        onSelectTasks={() => router.replace('/daily-tasks')}
        style={styles.pill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginBottom: 18,
  },
  pill: {
    width: 290,
  },
});