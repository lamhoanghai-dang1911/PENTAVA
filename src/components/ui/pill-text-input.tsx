import { Design, FontFamily } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

type PillTextInputProps = TextInputProps & {
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
};

export function PillTextInput({
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  style,
  placeholderTextColor = Design.colors.disabled,
  ...props
}: PillTextInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={showPasswordToggle && !isPasswordVisible}
        style={[styles.input, showPasswordToggle && styles.passwordInput, style]}
        {...props}
      />
      {showPasswordToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          accessibilityState={{ checked: isPasswordVisible }}
          hitSlop={8}
          onPress={onTogglePassword}
          style={styles.toggleButton}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color={Design.colors.mutedText}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    borderRadius: Design.borderRadius.pill,
    borderWidth: 1,
    borderColor: Design.colors.black,
    backgroundColor: Design.colors.white,
    paddingHorizontal: 25,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.body,
    color: Design.colors.black,
  },
  passwordInput: {
    paddingRight: 62,
  },
  toggleButton: {
    position: 'absolute',
    right: 18,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 22,
    height: 17,
  },
});
