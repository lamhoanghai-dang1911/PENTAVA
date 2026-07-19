import { PurchaseSuccessModal } from '@/components/home/purchase-success-modal';
import { ShopSheet, type ShopProduct } from '@/components/home/shop-sheet';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { data } = useOnboarding();
  const displayName = data.name.trim() || 'bạn';

  // TODO: số dư tiền tệ nên lấy từ server/AsyncStorage — tạm dùng state cứng
  const [coins] = useState(15);
  const [strawberries, setStrawberries] = useState(15);
  const [stars] = useState(15);

  const [isShopVisible, setIsShopVisible] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<ShopProduct | null>(null);

  const handleBuy = (product: ShopProduct) => {
    if (product.price > strawberries) {
      Alert.alert('Không đủ số dư', 'Bạn chưa đủ 🍓 để mua vật phẩm này.');
      return;
    }
    setStrawberries((prev) => prev - product.price);
    setPurchasedProduct(product);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Chào {displayName}</Text>
            <View style={styles.currencyRow}>
              <View style={styles.currencyChip}>
                <Text style={styles.currencyText}>🪙 {coins}</Text>
              </View>
              <View style={styles.currencyChip}>
                <Text style={styles.currencyText}>🍓 {strawberries}</Text>
              </View>
              <View style={styles.currencyChip}>
                <Text style={styles.currencyText}>⭐ {stars}</Text>
              </View>
            </View>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.mascotCard}>
          <Image
            contentFit="contain"
            source={require('@/assets/images/onboarding/cat-loading.png')}
            style={styles.mascot}
          />
        </View>

        <View style={styles.routineCard}>
          <Text style={styles.routineLabel}>Routine hôm nay 🌱</Text>
          <Text style={styles.routineValue}>
            3<Text style={styles.routineValueMuted}>/5 Task</Text>
          </Text>
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekEmoji}>🌙</Text>
            <View style={styles.weekTextWrap}>
              <Text style={styles.weekTitle}>Soft reset weeks</Text>
              <Text style={styles.weekSubtitle}>Day 3/7</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '43%' }]} />
          </View>
          <Text style={styles.progressPercent}>43%</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cửa hàng"
          onPress={() => setIsShopVisible(true)}
          style={styles.roundButton}>
          <Ionicons color={Design.colors.white} name="storefront-outline" size={22} />
        </Pressable>

        <View style={styles.togglePill}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/daily-tasks')}
            style={styles.toggleOption}>
            <Text style={styles.toggleText}>Nhiệm vụ ngày</Text>
          </Pressable>
          <View style={styles.toggleDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/cinema')}
            style={styles.toggleOption}>
            <Text style={styles.toggleText}>PENTA-CINEMA</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ngôn ngữ"
          onPress={() => router.push('/community')}
          style={[styles.roundButton, styles.roundButtonOutline]}>
          <Ionicons color={Design.colors.black} name="globe-outline" size={22} />
        </Pressable>
      </View>

      <ShopSheet
        balance={strawberries}
        onBuy={handleBuy}
        onClose={() => setIsShopVisible(false)}
        purchasedProduct={purchasedProduct}
        onCloseSuccess={() => setPurchasedProduct(null)}
        visible={isShopVisible}
      />

      <PurchaseSuccessModal
        balance={strawberries}
        onClose={() => setPurchasedProduct(null)}
        product={purchasedProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Design.colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.h2 - 2,
    color: Design.colors.black,
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 6,
  },
  currencyChip: {
    borderWidth: 1,
    borderColor: Design.colors.optionBorder,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Design.colors.white,
  },
  currencyText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    color: Design.colors.black,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3D9C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    color: Design.colors.black,
  },
  mascotCard: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  mascot: {
    width: 230,
    height: 240,
  },
  routineCard: {
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    backgroundColor: Design.colors.white,
  },
  routineLabel: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    color: Design.colors.mutedText,
    marginBottom: 4,
  },
  routineValue: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.h2,
    color: Design.colors.black,
  },
  routineValueMuted: {
    color: Design.colors.mutedText,
    fontSize: Design.fontSize.title,
  },
  weekCard: {
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  weekTextWrap: {
    flex: 1,
  },
  weekTitle: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body - 2,
    color: Design.colors.white,
  },
  weekSubtitle: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    color: Design.colors.white,
    opacity: 0.85,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F2B544',
  },
  progressPercent: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
    color: Design.colors.white,
    alignSelf: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  roundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Design.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonOutline: {
    backgroundColor: Design.colors.white,
    borderWidth: 1,
    borderColor: Design.colors.black,
  },
  togglePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Design.colors.optionBorder,
    backgroundColor: Design.colors.white,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDivider: {
    width: 1,
    height: '55%',
    backgroundColor: Design.colors.optionBorder,
  },
  toggleText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    color: Design.colors.black,
  },
});
