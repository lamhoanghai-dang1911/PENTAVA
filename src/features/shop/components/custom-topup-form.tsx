import React from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Design } from "@/src/constants/design";
import { formatVnd } from "../utils/shop-utils";
import { styles } from "../shop.styles";
import type { CustomTopupFormProps } from "../types/shop";

export function CustomTopupForm({
  pricing,
  rubyInput,
  onChangeRubyInput,
  onBlur,
  amountVnd,
  isValidAmount,
  isSubmitting,
  errorMessage,
  onSubmit,
}: CustomTopupFormProps) {
  const parsedRuby = Number(rubyInput);
  const isInputEmpty = !rubyInput.trim();

  return (
    <>
      <Text style={styles.inputLabel}>Số Ruby muốn nạp</Text>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel="Số Ruby muốn nạp"
          editable={pricing !== null}
          keyboardType="number-pad"
          onBlur={onBlur}
          onChangeText={onChangeRubyInput}
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
          {parsedRuby > 0 && Number.isSafeInteger(parsedRuby)
            ? formatVnd(amountVnd)
            : "—"}
        </Text>
      </View>
      {pricing ? (
        <Text style={styles.minimumHint}>
          Nạp lẻ tối thiểu {pricing.minCustomTopupRuby} Ruby
          {" "}({formatVnd(pricing.minCustomTopupVnd)}).
        </Text>
      ) : null}

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting || isInputEmpty }}
        disabled={isSubmitting || isInputEmpty}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          (isSubmitting || isInputEmpty) && styles.disabledButton,
          pressed && !isSubmitting && !isInputEmpty && styles.pressedButton,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={Design.colors.white} />
        ) : (
          <Text style={styles.submitLabel}>Tạo mã QR nạp tiền</Text>
        )}
      </Pressable>
    </>
  );
}
