import { Design, FontFamily } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ShopHeaderProps = {
  rubyBalance: number | null;
  isRubyLoading?: boolean;
  isNight?: boolean;
  onTopUpPress: () => void;
};

export const ShopHeader = React.memo(function ShopHeader({
  rubyBalance,
  isRubyLoading = false,
  isNight = false,
  onTopUpPress,
}: ShopHeaderProps) {
  return (
    <View style={[styles.headerContainer, isNight && styles.headerContainerNight]}>
      <View style={styles.titleWrap}>
        <Text style={[styles.title, isNight && styles.titleNight]}>Cửa hàng PENTAVA</Text>
        <Text style={[styles.subtitle, isNight && styles.subtitleNight]}>
          Thời trang cho bé mèo cưng ✨
        </Text>
      </View>

      <Pressable
        accessibilityLabel={`Số dư Ruby: ${rubyBalance ?? 0}. Nhấn để nạp thêm`}
        accessibilityRole="button"
        onPress={onTopUpPress}
        style={({ pressed }) => [
          styles.balanceChip,
          isNight && styles.balanceChipNight,
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}>
        <Image
          contentFit="contain"
          source={require('@/assets/images/ruby.png')}
          style={styles.rubyImage}
        />
        <Text style={[styles.balanceText, isNight && styles.balanceTextNight]}>
          {isRubyLoading && rubyBalance === null ? '...' : (rubyBalance ?? 0)}
        </Text>
        <View style={[styles.plusCircle, isNight && styles.plusCircleNight]}>
          <Ionicons color="#FFFFFF" name="add" size={12} />
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerContainerNight: {
    borderBottomColor: '#1E293B',
  },
  titleWrap: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#0F291E',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 18,
  },
  titleNight: {
    color: '#F8FAFC',
  },
  subtitle: {
    color: '#64748B',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11.5,
    marginTop: 2,
  },
  subtitleNight: {
    color: '#94A3B8',
  },
  balanceChip: {
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  balanceChipNight: {
    backgroundColor: '#1E1B2E',
    borderColor: '#F43F5E',
  },
  rubyImage: {
    height: 18,
    width: 18,
  },
  balanceText: {
    color: '#E11D48',
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 13,
  },
  balanceTextNight: {
    color: '#FDA4AF',
  },
  plusCircle: {
    alignItems: 'center',
    backgroundColor: '#E11D48',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    marginLeft: 2,
    width: 16,
  },
  plusCircleNight: {
    backgroundColor: '#F43F5E',
  },
});
