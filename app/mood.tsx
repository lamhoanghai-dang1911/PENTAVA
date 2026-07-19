import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider'; // Hoặc tự chế Slider bằng PanGesture
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');


// Định nghĩa dữ liệu 3 trạng thái Mood tương ứng Figma
const MOODS = [
  { label: 'TỆ', color: '#FFC145' },       // Vàng cam
  { label: 'BÌNH THƯỜNG', color: '#4EA3F7' }, // Xanh dương
  { label: 'TỐT', color: '#4CD080' }       // Xanh lá
];

export default function MoodScreen() {
  const progress = useSharedValue(0); // Giá trị từ 0 đến 2 tương ứng 3 mood
  const [comment, setComment] = useState('');
  const min = useSharedValue(0);
  const max = useSharedValue(2);
  const router = useRouter();

  // 1. Hiệu ứng mượt mà chuyển đổi màu nền theo vị trí trượt
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1, 2],
      [MOODS[0].color, MOODS[1].color, MOODS[2].color]
    );
    return { backgroundColor };
  });

  // Tìm index hiện tại để hiển thị Text Text phù hợp
  const [currentIdx, setCurrentIdx] = useState(0);

  // 2. Tạo hình dáng hoạt họa cho từng nét mặt (Motion biến hình)
  // --- Mắt Trái & Phải ---
  const animatedEyeStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(progress.value, [0, 1, 2], [1, 1, 1]); 
    return { transform: [{ scaleY }] };
  });

  // --- Chân mày (Ngoác lên, nằm ngang, cong xuống) ---
  const animatedLeftBrow = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [-15, 0, 0]); // Tệ: xếch ngược lên
    const translateY = interpolate(progress.value, [0, 1, 2], [5, 0, 0]);
    return { transform: [{ rotate: `${rotate}deg` }, { translateY }] };
  });

  const animatedRightBrow = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [15, 0, 0]);
    const translateY = interpolate(progress.value, [0, 1, 2], [5, 0, 0]);
    return { transform: [{ rotate: `${rotate}deg` }, { translateY }] };
  });

  // --- Cái Miệng (Há hốc to -> Dẹt phẳng -> Cười cong) ---
  const animatedMouthStyle = useAnimatedStyle(() => {
    const height = interpolate(progress.value, [0, 1, 2], [45, 8, 30]); // Tệ: Tròn to, Bình thường: Dẹt, Tốt: Bán nguyệt
    const widthMouth = interpolate(progress.value, [0, 1, 2], [45, 45, 45]);
    const borderRadius = interpolate(progress.value, [0, 1, 2], [22, 4, 0]); // Tốt sẽ không dùng tròn đều mà bo đáy
    
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

  return (
    <Animated.View style={[styles.container, animatedBackgroundStyle]}>
      {/* Header */}
      <Text style={styles.headerTitle}>Hôm nay bạn thế nào?</Text>

      {/* Vùng vẽ khuôn mặt hoạt hình Mascot */}
      <View style={styles.mascotContainer}>
        {/* Chân mày */}
        <View style={styles.row}>
          <Animated.View style={[styles.eyebrow, animatedLeftBrow]} />
          <Animated.View style={[styles.eyebrow, animatedRightBrow]} />
        </View>

        {/* Cặp mắt */}
        <View style={[styles.row, { marginTop: 15 }]}>
          <Animated.View style={[styles.eye, animatedEyeStyle]} />
          <Animated.View style={[styles.eye, animatedEyeStyle]} />
        </View>

        {/* Cái miệng chuyển động linh hoạt */}
        <View style={styles.mouthWrapper}>
          <Animated.View style={[styles.mouth, animatedMouthStyle]} />
        </View>
      </View>

      {/* Nhãn chữ hiển thị Mood lớn */}
      <Text style={styles.moodLabel}>{MOODS[currentIdx].label}</Text>

      {/* Thanh Slider Custom trượt qua lại giữa 3 điểm chấm tròn */}
      <View style={styles.sliderWrapper}>
        <View style={styles.sliderTrackLine} />
        {/* 3 Nút chấm định vị nền trắng */}
        <View style={styles.dotsRow}>
          <View style={styles.dotNode} />
          <View style={styles.dotNode} />
          <View style={styles.dotNode} />
        </View>

        {/* Nút kéo tương tác thực tế */}
        <Slider
          style={styles.actualSlider}
          progress={progress}
          minimumValue={min}
          maximumValue={max}
          step={2}
          onSlidingComplete={(v) => {
            const rounded = Math.round(v);
            progress.value = withTiming(rounded); // Nhảy mượt vào điểm khấc
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

      {/* Hộp nhập Comment và Nút Submit dưới đáy */}
      <View style={styles.commentBox}>
        <TextInput
          style={styles.input}
          placeholder="Comment...."
          placeholderTextColor="rgba(255,255,255,0.6)"
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8}>
          <Text style={[styles.submitText, { color: MOODS[currentIdx].color }]}>Submit</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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