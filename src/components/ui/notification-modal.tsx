import { Design, FontFamily } from '@/src/constants/design';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
    return (
        <Modal
            animationType="fade"
            onRequestClose={onConfirm}
            transparent
            visible={visible}>
            <View style={styles.overlay}>
                <View accessibilityRole="alert" style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={onConfirm}
                        style={styles.button}>
                        <Text style={styles.buttonText}>OK</Text>
                    </Pressable>
                </View>
            </View>
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