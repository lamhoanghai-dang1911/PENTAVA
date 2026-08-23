import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

import { MoodMascot } from '@/src/features/mood/components/MoodMascot';
import { MOOD_OPTIONS, useMoodSelector } from '@/src/features/mood/hooks/useMoodSelector';

export default function MoodScreen() {
  const router = useRouter();
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(2);
  const { comment, setComment, currentIndex, selectedMood, setMoodBySlider } = useMoodSelector();

  useEffect(() => {
    progress.value = withTiming(currentIndex, { duration: 200 });
  }, [currentIndex, progress]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    router.replace('/(tabs)');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Animated.View style={[styles.container, { backgroundColor: selectedMood.color }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.keyboardAvoiding}
        >
          <Text style={styles.headerTitle}>Hôm nay bạn thế nào?</Text>

          <MoodMascot progress={progress} currentIndex={currentIndex} />

          <Text style={styles.moodLabel}>{selectedMood.label}</Text>

          <View style={styles.sliderWrapper}>
            <View style={styles.sliderTrackLine} />
            <View style={styles.dotsRow}>
              {MOOD_OPTIONS.map((mood) => (
                <View key={mood.label} style={[styles.dotNode, { backgroundColor: mood.color }]} />
              ))}
            </View>

            <Slider
              style={styles.actualSlider}
              progress={progress}
              minimumValue={min}
              maximumValue={max}
              step={2}
              onSlidingComplete={(value) => {
                setMoodBySlider(value);
              }}
              thumbWidth={26}
              theme={{
                disableMinTrackTintColor: 'transparent',
                maximumTrackTintColor: 'transparent',
                minimumTrackTintColor: 'transparent',
                cacheTrackTintColor: 'transparent',
                bubbleBackgroundColor: 'transparent',
                heartbeatColor: 'transparent',
              }}
              renderThumb={() => <View style={styles.customThumb} />}
            />
          </View>

          <View style={styles.commentBox}>
            <TextInput
              style={styles.input}
              placeholder="Comment...."
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleSubmit}>
              <Text style={[styles.submitText, { color: selectedMood.color }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoiding: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  moodLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.5,
    marginVertical: 10,
  },
  sliderWrapper: {
    width: '80%',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackLine: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    left: 10,
    right: 10,
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  dotNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actualSlider: {
    position: 'absolute',
    width: '100%',
    height: 40,
  },
  customThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  commentBox: {
    width: '100%',
    paddingHorizontal: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  submitBtn: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontWeight: '700',
    fontSize: 16,
  },
});

