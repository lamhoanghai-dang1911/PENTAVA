import { Design, FontFamily } from '@/constants/design';
import { Image, Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

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
        style={[styles.input, style]}
        {...props}
      />
      {showPasswordToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          hitSlop={8}
          onPress={onTogglePassword}
          style={styles.toggleButton}>
          <Image source={require('@/assets/images/auth/eye-icon.png')} style={styles.eyeIcon} />
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
  toggleButton: {
    position: 'absolute',
    right: 32,
    padding: 4,
  },
  eyeIcon: {
    width: 15,
    height: 12,
  },
});
