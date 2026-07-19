import { Design, FontFamily } from '@/constants/design';
import { StyleSheet, Text, View } from 'react-native';

type DividerWithTextProps = {
  text?: string;
};

export function DividerWithText({ text = 'Hoặc' }: DividerWithTextProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.lineShort} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Design.colors.divider,
    maxWidth: 116,
  },
  lineShort: {
    flex: 1,
    height: 1,
    backgroundColor: Design.colors.divider,
    maxWidth: 110,
  },
  text: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    color: Design.colors.mutedText,
  },
});
