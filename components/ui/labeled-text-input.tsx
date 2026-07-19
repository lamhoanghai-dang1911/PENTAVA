import { Design, FontFamily } from '@/constants/design';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type LabeledTextInputProps = TextInputProps & {
  label: string;
};

export function LabeledTextInput({ label, value, style, ...props }: LabeledTextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Design.colors.disabled}
        style={[styles.input, style]}
        value={value}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    borderRadius: Design.borderRadius.input,
    borderWidth: 1,
    borderColor: Design.colors.inputBorder,
    backgroundColor: Design.colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    color: Design.colors.disabled,
    marginBottom: 2,
  },
  input: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.body,
    color: Design.colors.black,
    padding: 0,
  },
});
