import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type DayNightBackgroundProps = {
  isNight: boolean;
};

// ==================== CÁC ĐOM ĐÓM BAN ĐÊM (FIREFLIES) ====================
function Firefly({
  x,
  y,
  delay = 0,
  size = 6,
}: {
  x: number;
  y: number;
  delay?: number;
  size?: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
          withTiming(8, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(-6, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.85, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, opacity, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.fireflyContainer,
        {
          left: (x / 390) * SCREEN_WIDTH,
          top: (y / 844) * SCREEN_HEIGHT,
          width: size * 3,
          height: size * 3,
        },
        animatedStyle,
      ]}>
      {/* Vầng sáng vàng xanh bao quanh đom đóm */}
      <View
        style={[
          styles.fireflyGlow,
          {
            width: size * 2.6,
            height: size * 2.6,
            borderRadius: (size * 2.6) / 2,
          },
        ]}
      />
      {/* Tâm sáng đom đóm */}
      <View
        style={[
          styles.fireflyCore,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

// ==================== CẢNH BAN NGÀY (DAY SCENE) ====================
function DayScene() {
  return (
    <Svg
      height="100%"
      preserveAspectRatio="xMidYMin slice"
      viewBox="0 0 390 844"
      width="100%">
      <Defs>
        {/* Bầu trời xanh tươi mát ban ngày */}
        <LinearGradient id="daySky" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#68B6F2" />
          <Stop offset="25%" stopColor="#96D2FC" />
          <Stop offset="50%" stopColor="#BAE6FD" />
          <Stop offset="75%" stopColor="#E0F2FE" />
          <Stop offset="100%" stopColor="#DCFCE7" />
        </LinearGradient>

        {/* Quầng sáng mặt trời */}
        <RadialGradient cx="50%" cy="50%" id="sunAura" r="50%">
          <Stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.9" />
          <Stop offset="40%" stopColor="#FDE047" stopOpacity="0.4" />
          <Stop offset="70%" stopColor="#FACC15" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
        </RadialGradient>

        <LinearGradient id="sunCore" x1="0%" x2="100%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="45%" stopColor="#FDE047" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>

        {/* Đồi xa (Lớp 1) - Xanh lá nhạt tươi non */}
        <LinearGradient id="dayBackHills" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#86EFAC" />
          <Stop offset="100%" stopColor="#4ADE80" />
        </LinearGradient>

        {/* Đồi trung cảnh (Lớp 2) - Xanh lá tươi mướt */}
        <LinearGradient id="dayMidHills" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="100%" stopColor="#16A34A" />
        </LinearGradient>

        {/* Đồi tiền cảnh ngay dưới linh vật (Lớp 3) - Cỏ tươi thẫm mượt mà */}
        <LinearGradient id="dayForeHills" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#4ADE80" />
          <Stop offset="16%" stopColor="#22C55E" />
          <Stop offset="45%" stopColor="#16A34A" />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
      </Defs>

      {/* 1. Nền bầu trời */}
      <Rect fill="url(#daySky)" height="844" width="390" x="0" y="0" />

      {/* 2. Mặt trời rực rỡ tỏa nắng */}
      <Circle cx="315" cy="115" fill="url(#sunAura)" r="64" />
      <Circle cx="315" cy="115" fill="#FDE047" opacity="0.35" r="42" />
      <Circle cx="315" cy="115" fill="url(#sunCore)" r="25" />

      {/* Các tia sáng lấp lánh nhẹ của mặt trời */}
      <Path
        d="M315 76 L315 84 M315 146 L315 154 M276 115 L284 115 M346 115 L354 115 M287 87 L293 93 M337 137 L343 143 M287 143 L293 137 M337 93 L343 87"
        opacity="0.5"
        stroke="#FDE047"
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      {/* 3. Những đám mây trắng mềm mại trôi bồng bềnh */}
      {/* Mây 1 - góc trên trái */}
      <G opacity="0.85">
        <Path
          d="M35 88 H90 A14 14 0 0 0 90 60 A18 18 0 0 0 62 52 A15 15 0 0 0 35 64 A12 12 0 0 0 35 88 Z"
          fill="#FFFFFF"
        />
      </G>

      {/* Mây 2 - bên phải gần mặt trời */}
      <G opacity="0.7">
        <Path
          d="M210 160 H260 A11 11 0 0 0 260 138 A15 15 0 0 0 236 130 A12 12 0 0 0 210 142 A10 10 0 0 0 210 160 Z"
          fill="#FFFFFF"
        />
      </G>

      {/* Mây 3 - thấp hơn góc trái */}
      <G opacity="0.55">
        <Path
          d="M0 205 H55 A12 12 0 0 0 55 181 A16 16 0 0 0 30 173 A13 13 0 0 0 8 184 A11 11 0 0 0 0 205 Z"
          fill="#FFFFFF"
        />
      </G>

      {/* 4. Những cánh chim bay lượn trên nền trời */}
      <Path
        d="M72 135 Q77 129 82 135 Q87 129 92 135"
        fill="none"
        opacity="0.65"
        stroke="#4785AC"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <Path
        d="M96 122 Q100 117 104 122 Q108 117 112 122"
        fill="none"
        opacity="0.55"
        stroke="#4785AC"
        strokeLinecap="round"
        strokeWidth="1.3"
      />

      {/* 5. Dãy đồi xanh xa (Lớp 1) */}
      <Path
        d="M-20 470 Q70 405 180 445 T410 425 L410 850 L-20 850 Z"
        fill="url(#dayBackHills)"
      />
      {/* Rặng cây xanh tròn trên đỉnh đồi xa */}
      <Circle cx="60" cy="420" fill="#6BD28D" r="14" />
      <Circle cx="76" cy="415" fill="#52C476" r="17" />
      <Circle cx="92" cy="421" fill="#6BD28D" r="13" />
      <Circle cx="295" cy="436" fill="#59C87D" r="15" />
      <Circle cx="312" cy="430" fill="#4ABA6F" r="18" />
      <Circle cx="330" cy="438" fill="#59C87D" r="13" />

      {/* 6. Đồi xanh trung cảnh & Cây cối (Lớp 2) */}
      <Path
        d="M-20 505 Q90 470 210 510 T420 465 L420 850 L-20 850 Z"
        fill="url(#dayMidHills)"
      />
      {/* Cây thông bên phải */}
      <Polygon fill="#229D52" points="350,448 342,468 358,468" />
      <Polygon fill="#1C8645" points="350,460 340,480 360,480" />
      <Polygon fill="#157037" points="350,472 338,494 362,494" />
      <Rect fill="#78350F" height="8" rx="1" width="4" x="348" y="494" />

      {/* Cây tán tròn xinh xắn bên trái */}
      <Rect fill="#854D0E" height="12" rx="1" width="4" x="43" y="495" />
      <Circle cx="45" cy="485" fill="#2FC166" r="17" />
      <Circle cx="40" cy="480" fill="#46D87D" r="11" />
      <Circle cx="51" cy="488" fill="#23A856" r="10" />

      {/* Bụi cây xanh mướt */}
      <Circle cx="120" cy="508" fill="#30B967" r="10" />
      <Circle cx="132" cy="506" fill="#4ADE80" r="12" />
      <Circle cx="144" cy="509" fill="#259D54" r="9" />

      {/* 7. Đồi cỏ tiền cảnh ngay dưới linh vật (Lớp 3) */}
      <Path
        d="M-20 545 Q80 515 200 545 T420 520 L420 850 L-20 850 Z"
        fill="url(#dayForeHills)"
      />

      {/* Cụm cỏ xanh tươi tốt vươn lên viền đồi */}
      {/* Cụm 1 */}
      <Path
        d="M28 538 Q24 526 20 522 M29 538 Q30 522 31 518 M30 538 Q35 525 40 523"
        fill="none"
        stroke="#86EFAC"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 2 */}
      <Path
        d="M113 530 Q109 518 105 514 M114 530 Q115 514 116 510 M115 530 Q120 517 125 515"
        fill="none"
        stroke="#A7F3D0"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 3 */}
      <Path
        d="M178 546 Q174 534 170 530 M179 546 Q180 530 181 526 M180 546 Q185 533 190 531"
        fill="none"
        stroke="#4ADE80"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 4 */}
      <Path
        d="M268 536 Q264 524 260 520 M269 536 Q270 520 271 516 M270 536 Q275 523 280 521"
        fill="none"
        stroke="#86EFAC"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 5 */}
      <Path
        d="M348 530 Q344 518 340 514 M349 530 Q350 514 351 510 M350 530 Q355 517 360 515"
        fill="none"
        stroke="#A7F3D0"
        strokeLinecap="round"
        strokeWidth="2.2"
      />

      {/* 8. Những bông hoa cúc trắng nhụy vàng & hoa dại tươi vui */}
      {/* Hoa cúc 1 */}
      <G>
        <Circle cx="66" cy="548" fill="#FFFFFF" r="3.5" />
        <Circle cx="74" cy="548" fill="#FFFFFF" r="3.5" />
        <Circle cx="70" cy="544" fill="#FFFFFF" r="3.5" />
        <Circle cx="70" cy="552" fill="#FFFFFF" r="3.5" />
        <Circle cx="70" cy="548" fill="#FBBF24" r="2.8" />
      </G>

      {/* Hoa cúc 2 */}
      <G>
        <Circle cx="226" cy="552" fill="#FFFFFF" r="3.5" />
        <Circle cx="234" cy="552" fill="#FFFFFF" r="3.5" />
        <Circle cx="230" cy="548" fill="#FFFFFF" r="3.5" />
        <Circle cx="230" cy="556" fill="#FFFFFF" r="3.5" />
        <Circle cx="230" cy="552" fill="#FBBF24" r="2.8" />
      </G>

      {/* Hoa cúc 3 */}
      <G>
        <Circle cx="317" cy="549" fill="#FFFFFF" r="3" />
        <Circle cx="323" cy="549" fill="#FFFFFF" r="3" />
        <Circle cx="320" cy="546" fill="#FFFFFF" r="3" />
        <Circle cx="320" cy="552" fill="#FFFFFF" r="3" />
        <Circle cx="320" cy="549" fill="#F59E0B" r="2.3" />
      </G>

      {/* Hoa dại màu hồng pastel */}
      <Circle cx="140" cy="558" fill="#F472B6" r="3.5" />
      <Circle cx="140" cy="558" fill="#FEF08A" r="1.5" />

      {/* Hoa dại màu vàng rực */}
      <Circle cx="285" cy="558" fill="#FDE047" r="3.5" />
      <Circle cx="285" cy="558" fill="#F59E0B" r="1.5" />

      {/* Bông bồ công anh lấp lánh trôi trong gió */}
      <Circle cx="85" cy="480" fill="#FFFFFF" opacity="0.6" r="1.6" />
      <Circle cx="160" cy="450" fill="#FFFFFF" opacity="0.75" r="2" />
      <Circle cx="240" cy="475" fill="#FFFFFF" opacity="0.5" r="1.5" />
      <Circle cx="300" cy="445" fill="#FFFFFF" opacity="0.7" r="1.8" />
    </Svg>
  );
}

// ==================== CẢNH BAN ĐÊM (NIGHT SCENE) ====================
function NightScene() {
  return (
    <Svg
      height="100%"
      preserveAspectRatio="xMidYMin slice"
      viewBox="0 0 390 844"
      width="100%">
      <Defs>
        {/* Bầu trời đêm huyền ảo xanh đen sâu thẳm */}
        <LinearGradient id="nightSky" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#0B132B" />
          <Stop offset="25%" stopColor="#1C2541" />
          <Stop offset="55%" stopColor="#25355A" />
          <Stop offset="75%" stopColor="#1B3842" />
          <Stop offset="100%" stopColor="#0D231E" />
        </LinearGradient>

        {/* Quầng sáng dịu êm của vầng trăng */}
        <RadialGradient cx="50%" cy="50%" id="moonAura" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <Stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.3" />
          <Stop offset="65%" stopColor="#93C5FD" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </RadialGradient>

        <LinearGradient id="moonGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFDF0" />
          <Stop offset="60%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#FDE047" />
        </LinearGradient>

        {/* Đồi xa ban đêm - Xanh chàm sẫm */}
        <LinearGradient id="nightBackHills" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#1B3A36" />
          <Stop offset="100%" stopColor="#112926" />
        </LinearGradient>

        {/* Đồi trung cảnh ban đêm - Xanh rừng sẫm màu */}
        <LinearGradient id="nightMidHills" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#153B2D" />
          <Stop offset="100%" stopColor="#0E281F" />
        </LinearGradient>

        {/* Đồi tiền cảnh sẫm màu dưới ánh trăng - mượt mà huyền ảo */}
        <LinearGradient id="nightForeHills" x1="0%" x2="0%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor="#2D6A4F" />
          <Stop offset="20%" stopColor="#1B4D36" />
          <Stop offset="50%" stopColor="#133827" />
          <Stop offset="100%" stopColor="#0B2117" />
        </LinearGradient>
      </Defs>

      {/* 1. Nền trời đêm */}
      <Rect fill="url(#nightSky)" height="844" width="390" x="0" y="0" />

      {/* 2. Vầng trăng khuyết lung linh với hào quang dịu êm */}
      <Circle cx="315" cy="115" fill="url(#moonAura)" r="58" />
      <Circle cx="315" cy="115" fill="#E0F2FE" opacity="0.18" r="38" />

      {/* Trăng lưỡi liềm mạ vàng ngọc thanh nhã */}
      <Path
        d="M305 94 A 23 23 0 1 0 332 136 A 21 21 0 1 1 305 94 Z"
        fill="url(#moonGradient)"
      />
      {/* Vết lõm mặt trăng mờ nhẹ nghệ thuật */}
      <Circle cx="308" cy="117" fill="#FACC15" opacity="0.4" r="2.8" />
      <Circle cx="314" cy="125" fill="#FACC15" opacity="0.35" r="1.8" />

      {/* 3. Dải sao lấp lánh trên bầu trời đêm */}
      {/* Ngôi sao tỏa tia ✦ */}
      {/* Sao 1 */}
      <Path
        d="M60 62 Q60 68 66 68 Q60 68 60 74 Q60 68 54 68 Q60 68 60 62 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
      {/* Sao 2 */}
      <Path
        d="M160 38 Q160 44 166 44 Q160 44 160 50 Q160 44 154 44 Q160 44 160 38 Z"
        fill="#BAE6FD"
        opacity="0.95"
      />
      {/* Sao 3 */}
      <Path
        d="M235 80 Q235 85 240 85 Q235 85 235 90 Q235 85 230 85 Q235 85 235 80 Z"
        fill="#FEF08A"
        opacity="0.85"
      />
      {/* Sao 4 */}
      <Path
        d="M105 135 Q105 140 110 140 Q105 140 105 145 Q105 140 100 140 Q105 140 105 135 Z"
        fill="#FFFFFF"
        opacity="0.85"
      />
      {/* Sao 5 */}
      <Path
        d="M275 165 Q275 170 280 170 Q275 170 275 175 Q275 170 270 170 Q275 170 275 165 Z"
        fill="#BAE6FD"
        opacity="0.8"
      />

      {/* Các đốm sao tinh tú nhỏ trải khắp trời */}
      <Circle cx="25" cy="40" fill="#FFFFFF" opacity="0.7" r="1.2" />
      <Circle cx="85" cy="30" fill="#BAE6FD" opacity="0.8" r="1.5" />
      <Circle cx="120" cy="80" fill="#FFFFFF" opacity="0.6" r="1" />
      <Circle cx="185" cy="95" fill="#FEF9C3" opacity="0.75" r="1.6" />
      <Circle cx="200" cy="30" fill="#FFFFFF" opacity="0.7" r="1.3" />
      <Circle cx="225" cy="55" fill="#BAE6FD" opacity="0.6" r="1" />
      <Circle cx="355" cy="55" fill="#FFFFFF" opacity="0.8" r="1.4" />
      <Circle cx="370" cy="95" fill="#FEF08A" opacity="0.7" r="1.2" />
      <Circle cx="350" cy="160" fill="#FFFFFF" opacity="0.85" r="1.5" />
      <Circle cx="45" cy="160" fill="#FFFFFF" opacity="0.6" r="1.1" />
      <Circle cx="80" cy="200" fill="#BAE6FD" opacity="0.75" r="1.4" />
      <Circle cx="145" cy="175" fill="#FFFFFF" opacity="0.5" r="1" />
      <Circle cx="175" cy="220" fill="#FEF9C3" opacity="0.8" r="1.5" />
      <Circle cx="230" cy="210" fill="#FFFFFF" opacity="0.65" r="1.2" />
      <Circle cx="330" cy="225" fill="#BAE6FD" opacity="0.7" r="1.3" />
      <Circle cx="20" cy="235" fill="#FFFFFF" opacity="0.6" r="1" />
      <Circle cx="95" cy="260" fill="#FEF08A" opacity="0.7" r="1.4" />
      <Circle cx="260" cy="250" fill="#FFFFFF" opacity="0.8" r="1.6" />
      <Circle cx="370" cy="220" fill="#FFFFFF" opacity="0.6" r="1.1" />

      {/* 4. Những áng mây đêm mờ ảo lướt ngang trời */}
      <Path
        d="M25 105 H85 A14 14 0 0 0 85 77 A18 18 0 0 0 58 69 A15 15 0 0 0 25 81 A12 12 0 0 0 25 105 Z"
        fill="#1E293B"
        opacity="0.4"
      />
      <Path
        d="M220 152 H272 A11 11 0 0 0 272 130 A15 15 0 0 0 248 122 A12 12 0 0 0 220 134 A10 10 0 0 0 220 152 Z"
        fill="#1E293B"
        opacity="0.32"
      />

      {/* 5. Dãy đồi xa ban đêm (Lớp 1) - Cây cỏ sẫm màu huyền bí */}
      <Path
        d="M-20 470 Q70 405 180 445 T410 425 L410 850 L-20 850 Z"
        fill="url(#nightBackHills)"
      />
      {/* Bóng cây sẫm màu in bóng lên bầu trời đêm */}
      <Circle cx="60" cy="420" fill="#0F2420" r="14" />
      <Circle cx="76" cy="415" fill="#0C1D1A" r="17" />
      <Circle cx="92" cy="421" fill="#0F2420" r="13" />
      <Circle cx="295" cy="436" fill="#0F2420" r="15" />
      <Circle cx="312" cy="430" fill="#0C1D1A" r="18" />
      <Circle cx="330" cy="438" fill="#0F2420" r="13" />

      {/* 6. Đồi trung cảnh sẫm màu & Rừng cây đêm (Lớp 2) */}
      <Path
        d="M-20 505 Q90 470 210 510 T420 465 L420 850 L-20 850 Z"
        fill="url(#nightMidHills)"
      />
      {/* Cây thông đêm bên phải */}
      <Polygon fill="#163C2E" points="350,448 342,468 358,468" />
      <Polygon fill="#112E23" points="350,460 340,480 360,480" />
      <Polygon fill="#0C231B" points="350,472 338,494 362,494" />
      <Rect fill="#1C1917" height="8" rx="1" width="4" x="348" y="494" />

      {/* Cây đêm tán tròn bên trái */}
      <Rect fill="#1C1917" height="12" rx="1" width="4" x="43" y="495" />
      <Circle cx="45" cy="485" fill="#133729" r="17" />
      <Circle cx="40" cy="480" fill="#1A4735" r="11" />
      <Circle cx="51" cy="488" fill="#102E23" r="10" />

      {/* Bụi cây đêm */}
      <Circle cx="120" cy="508" fill="#113326" r="10" />
      <Circle cx="132" cy="506" fill="#194534" r="12" />
      <Circle cx="144" cy="509" fill="#0E2B20" r="9" />

      {/* 7. Đồi tiền cảnh sẫm màu dưới chân linh vật (Lớp 3) */}
      <Path
        d="M-20 545 Q80 515 200 545 T420 520 L420 850 L-20 850 Z"
        fill="url(#nightForeHills)"
      />

      {/* Cụm cỏ đêm với viền lấp lánh ánh trăng */}
      {/* Cụm 1 */}
      <Path
        d="M28 538 Q24 526 20 522 M29 538 Q30 522 31 518 M30 538 Q35 525 40 523"
        fill="none"
        stroke="#2D6A4F"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 2 */}
      <Path
        d="M113 530 Q109 518 105 514 M114 530 Q115 514 116 510 M115 530 Q120 517 125 515"
        fill="none"
        stroke="#40916C"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 3 */}
      <Path
        d="M178 546 Q174 534 170 530 M179 546 Q180 530 181 526 M180 546 Q185 533 190 531"
        fill="none"
        stroke="#2D6A4F"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 4 */}
      <Path
        d="M268 536 Q264 524 260 520 M269 536 Q270 520 271 516 M270 536 Q275 523 280 521"
        fill="none"
        stroke="#40916C"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      {/* Cụm 5 */}
      <Path
        d="M348 530 Q344 518 340 514 M349 530 Q350 514 351 510 M350 530 Q355 517 360 515"
        fill="none"
        stroke="#2D6A4F"
        strokeLinecap="round"
        strokeWidth="2.2"
      />

      {/* 8. Hoa dạ nguyệt (Moonflowers) nở tỏa sáng dịu mát trong đêm */}
      {/* Hoa dạ nguyệt 1 */}
      <G>
        <Circle cx="66" cy="548" fill="#BAE6FD" opacity="0.8" r="3.2" />
        <Circle cx="74" cy="548" fill="#BAE6FD" opacity="0.8" r="3.2" />
        <Circle cx="70" cy="544" fill="#BAE6FD" opacity="0.8" r="3.2" />
        <Circle cx="70" cy="552" fill="#BAE6FD" opacity="0.8" r="3.2" />
        <Circle cx="70" cy="548" fill="#FEF08A" r="2.2" />
      </G>

      {/* Hoa thạch thảo tím đêm 2 */}
      <G>
        <Circle cx="226" cy="552" fill="#DDD6FE" opacity="0.85" r="3.2" />
        <Circle cx="234" cy="552" fill="#DDD6FE" opacity="0.85" r="3.2" />
        <Circle cx="230" cy="548" fill="#DDD6FE" opacity="0.85" r="3.2" />
        <Circle cx="230" cy="556" fill="#DDD6FE" opacity="0.85" r="3.2" />
        <Circle cx="230" cy="552" fill="#A7F3D0" r="2.2" />
      </G>

      {/* Hoa dạ nguyệt 3 */}
      <G>
        <Circle cx="317" cy="549" fill="#BAE6FD" opacity="0.75" r="2.8" />
        <Circle cx="323" cy="549" fill="#BAE6FD" opacity="0.75" r="2.8" />
        <Circle cx="320" cy="546" fill="#BAE6FD" opacity="0.75" r="2.8" />
        <Circle cx="320" cy="552" fill="#BAE6FD" opacity="0.75" r="2.8" />
        <Circle cx="320" cy="549" fill="#FEF9C3" r="1.8" />
      </G>
    </Svg>
  );
}

// ==================== COMPONENT CHÍNH DAY-NIGHT BACKGROUND ====================
export default function DayNightBackground({ isNight }: DayNightBackgroundProps) {
  // Animated opacity để chuyển cảnh ngày/đêm mượt mà như ánh hoàng hôn/bình minh
  const transitionProgress = useSharedValue(isNight ? 1 : 0);

  useEffect(() => {
    transitionProgress.value = withTiming(isNight ? 1 : 0, {
      duration: 700,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isNight, transitionProgress]);

  const dayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - transitionProgress.value,
  }));

  const nightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value,
  }));

  return (
    <View pointerEvents="none" style={styles.container}>
      {/* Lớp nền ban ngày */}
      <Animated.View style={[StyleSheet.absoluteFill, dayAnimatedStyle]}>
        <DayScene />
      </Animated.View>

      {/* Lớp nền ban đêm */}
      <Animated.View style={[StyleSheet.absoluteFill, nightAnimatedStyle]}>
        <NightScene />

        {/* Các chú đom đóm lập lòe bay lượn trong đêm hè */}
        <Firefly delay={0} size={5} x={85} y={435} />
        <Firefly delay={400} size={6} x={145} y={415} />
        <Firefly delay={800} size={5.5} x={205} y={445} />
        <Firefly delay={1200} size={5} x={265} y={420} />
        <Firefly delay={300} size={6} x={315} y={450} />
        <Firefly delay={900} size={4.5} x={60} y={465} />
        <Firefly delay={600} size={5.5} x={175} y={465} />
        <Firefly delay={1100} size={5} x={285} y={470} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  fireflyContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireflyGlow: {
    position: 'absolute',
    backgroundColor: '#BEF264',
    opacity: 0.35,
  },
  fireflyCore: {
    backgroundColor: '#FEF08A',
    shadowColor: '#CCFF00',
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
