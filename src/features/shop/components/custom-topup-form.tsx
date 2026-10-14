// src/features/shop/components/custom-topup-form.tsx
import { Design } from "@/src/constants/design";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "../shop.styles";
import type { CustomTopupFormProps } from "../types/shop";
import { formatVnd } from "../utils/shop-utils";

export function CustomTopupForm({
  pricing,
  rubyInput,
  onChangeRubyInput,
  amountVnd,
  isValidAmount,
  isSubmitting,
  errorMessage,
  onSubmit,
  onFocus,
}: CustomTopupFormProps) {
  const isDisabled = !isValidAmount || isSubmitting;

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit();
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.inputLabel}>Số Ruby muốn nạp</Text>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel="Số Ruby muốn nạp"
          editable={pricing !== null}
          keyboardType="number-pad"
          onChangeText={onChangeRubyInput}
          onFocus={onFocus}
          placeholder="Nhập số Ruby"
          placeholderTextColor={Design.colors.mutedText}
          style={styles.input}
          value={rubyInput}
        />
        <Image
          contentFit="contain"
          source={require("@/assets/images/ruby.png")}
          style={styles.rubyIcon}
        />
      </View>

      <View style={styles.amountPreview}>
        <Text style={styles.amountLabel}>Số tiền cần chuyển</Text>
        <Text style={styles.amountValue}>
          {isValidAmount ? formatVnd(amountVnd) : "—"}
        </Text>
      </View>

      {pricing ? (
        <Text style={styles.minimumHint}>
          Nạp lẻ tối thiểu {pricing.minCustomTopupRuby} Ruby{" "}
          ({formatVnd(pricing.minCustomTopupVnd)}).
        </Text>
      ) : null}

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          isDisabled && styles.disabledButton,
          pressed && !isDisabled && styles.pressedButton,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={Design.colors.white} />
        ) : (
          <Text style={styles.submitLabel}>Tạo mã QR nạp tiền</Text>
        )}
      </Pressable>
    </View>
  );
}
