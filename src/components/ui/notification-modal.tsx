import { Design, FontFamily } from '@/src/constants/design';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

type NotificationModalProps = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
};

export function NotificationModal({
    visible,
    title,
    message,
    onConfirm,
}: NotificationModalProps) {
    if (!visible) return null;

    return (
        <Modal
            animationType="none"
            onRequestClose={onConfirm}
            transparent
            visible={visible}>
            <Animated.View
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(150)}
                style={styles.overlay}>
                <Animated.View
                    accessibilityRole="alert"
                    entering={ZoomIn.springify().damping(16).stiffness(280)}
                    style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={onConfirm}
                        style={styles.button}>
                        <Text style={styles.buttonText}>OK</Text>
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    card: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 16,
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 16,
        backgroundColor: Design.colors.white,
        alignItems: 'center',
    },
    title: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        minWidth: 120,
        borderRadius: Design.borderRadius.button,
        backgroundColor: Design.colors.primaryGreen,
        paddingHorizontal: 24,
        paddingVertical: 11,
        alignItems: 'center',
    },
    buttonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
    },
});