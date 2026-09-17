import { FontFamily } from '@/src/constants/design';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

type AppTextProps = TextProps & {
    style?: StyleProp<TextStyle>;
};

export function AppText({ style, ...props }: AppTextProps) {
    return <Text {...props} style={[styles.default, style]} />;
}

const styles = StyleSheet.create({
    default: {
        fontFamily: FontFamily.beVietnamRegular,
    },
});