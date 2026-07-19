import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MOODS = [
  { label: 'TỆ', color: '#FFC145' },
  { label: 'BÌNH THƯỜNG', color: '#4EA3F7' },
  { label: 'TỐT', color: '#4CD080' },
];

export default function MoodScreen() {
  const progress = useSharedValue(0);
  const [comment, setComment] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const min = useSharedValue(0);
  const max = useSharedValue(2);
  const router = useRouter();

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1, 2],
      [MOODS[0].color, MOODS[1].color, MOODS[2].color]
    );
    return { backgroundColor };
  });

  const animatedEyeStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(progress.value, [0, 1, 2], [1, 1, 1]);
    return { transform: [{ scaleY }] };
  });

  const animatedLeftBrow = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [-15, 0, 0]);
    const translateY = interpolate(progress.value, [0, 1, 2], [5, 0, 0]);
    return { transform: [{ rotate: `${rotate}deg` }, { translateY }] };
  });

  const animatedRightBrow = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [15, 0, 0]);
    const translateY = interpolate(progress.value, [0, 1, 2], [5, 0, 0]);
    return { transform: [{ rotate: `${rotate}deg` }, { translateY }] };
  });

  const animatedMouthStyle = useAnimatedStyle(() => {
    const height = interpolate(progress.value, [0, 1, 2], [45, 8, 30]);
    const widthMouth = interpolate(progress.value, [0, 1, 2], [45, 45, 45]);
    const borderRadius = interpolate(progress.value, [0, 1, 2], [22, 4, 0]);

    return {
      height,
      width: widthMouth,
      borderRadius,
      borderBottomLeftRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 25]),
      borderBottomRightRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 25]),
      borderTopLeftRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 5]),
      borderTopRightRadius: interpolate(progress.value, [0, 1, 2], [22, 4, 5]),
    };
  });

  const handleSubmit = () => {
    Keyboard.dismiss();
    router.replace('/(tabs)');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Animated.View style={[styles.container, animatedBackgroundStyle]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.keyboardAvoiding}>
          <Text style={styles.headerTitle}>Hôm nay bạn thế nào?</Text>

          <View style={styles.mascotContainer}>
            <View style={styles.row}>
              <Animated.View style={[styles.eyebrow, animatedLeftBrow]} />
              <Animated.View style={[styles.eyebrow, animatedRightBrow]} />
            </View>

            <View style={[styles.row, styles.eyeRow]}>
              <Animated.View style={[styles.eye, animatedEyeStyle]} />
              <Animated.View style={[styles.eye, animatedEyeStyle]} />
            </View>

            <View style={styles.mouthWrapper}>
              <Animated.View style={[styles.mouth, animatedMouthStyle]} />
            </View>
          </View>

          <Text style={styles.moodLabel}>{MOODS[currentIdx].label}</Text>

          <View style={styles.sliderWrapper}>
            <View style={styles.sliderTrackLine} />
            <View style={styles.dotsRow}>
              <View style={styles.dotNode} />
              <View style={styles.dotNode} />
              <View style={styles.dotNode} />
            </View>

            <Slider
              style={styles.actualSlider}
              progress={progress}
              minimumValue={min}
              maximumValue={max}
              step={2}
              onSlidingComplete={(v) => {
                const rounded = Math.round(v);
                progress.value = withTiming(rounded);
                setCurrentIdx(rounded);
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
              <Text style={[styles.submitText, { color: MOODS[currentIdx].color }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  mascotContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
  },
  eyeRow: {
    marginTop: 15,
  },
  eyebrow: {
    width: 50,
    height: 6,
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  eye: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  mouthWrapper: {
    marginTop: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mouth: {
    backgroundColor: '#FFF',
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
    backgroundColor: '#FFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
  },
  input: {
    color: '#FFF',
    fontSize: 16,
    textAlignVertical: 'top',
    height: 90,
  },
  submitBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  submitText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
