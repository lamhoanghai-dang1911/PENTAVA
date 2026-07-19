import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Post = {
    id: string;
    author: string;
    avatarColor: string;
    timestamp: string;
    image: number;
    isVideo: boolean;
    caption: string;
    hiFives: number;
    hiFived: boolean;
    comments: string[];
};

// TODO: bài đăng nên lấy từ server — đang là dữ liệu mẫu theo Figma
const SEED_POSTS: Post[] = [
    {
        id: 'cuong',
        author: 'Cường',
        avatarColor: '#F3D9C6',
        timestamp: 'Hôm qua lúc 20:49',
        image: require('@/assets/images/onboarding/changtraingu.png'),
        isVideo: false,
        caption: 'Hôm nay mình đã để điện thoại xa giường trước khi ngủ.',
        hiFives: 4,
        hiFived: false,
        comments: [],
    },
    {
        id: 'thuy',
        author: 'Thuý',
        avatarColor: '#D6E4F5',
        timestamp: 'Hôm qua lúc 23:59',
        image: require('@/assets/images/onboarding/cogaihocbai.png'),
        isVideo: false,
        caption: 'Hôm nay mình đã để điện thoại ra xa để tập trung học trong 4 tiếng.',
        hiFives: 7,
        hiFived: false,
        comments: [],
    },
];

export default function CommunityScreen() {
    const { data } = useOnboarding();
    const displayName = data.name.trim() || 'Bạn';
    const { caption } = useLocalSearchParams<{ caption?: string }>();

    const [posts, setPosts] = useState<Post[]>(() => {
        // Nếu vừa đăng từ trang Diary thì bài của user hiện đầu bảng tin
        const myPost: Post[] =
            caption !== undefined
                ? [
                    {
                        id: 'me',
                        author: displayName,
                        avatarColor: '#F5D6DE',
                        timestamp: 'Mới đây',
                        image: require('@/assets/images/onboarding/cogai.png'),
                        isVideo: true,
                        caption: caption || 'Một tuần thật tuyệt vời',
                        hiFives: 0,
                        hiFived: false,
                        comments: [],
                    },
                ]
                : [];
        return [...myPost, ...SEED_POSTS];
    });

    const [thought, setThought] = useState('');
    const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
    const [commentDraft, setCommentDraft] = useState('');

    const toggleHiFive = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        hiFived: !post.hiFived,
                        hiFives: post.hiFived ? post.hiFives - 1 : post.hiFives + 1,
                    }
                    : post,
            ),
        );
    };

    const toggleCommentBox = (postId: string) => {
        setCommentDraft('');
        setOpenCommentPostId((prev) => (prev === postId ? null : postId));
    };

    const submitComment = (postId: string) => {
        const text = commentDraft.trim();
        if (!text) return;
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, comments: [...post.comments, text] } : post,
            ),
        );
        setCommentDraft('');
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}>
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Quay lại"
                        hitSlop={8}
                        onPress={() => router.replace('/(tabs)')}
                        style={styles.backButton}>
                        <Ionicons color={Design.colors.primaryGreen} name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Cộng đồng</Text>
                    <View style={styles.backButton} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.composer}>
                        <View style={[styles.avatar, { backgroundColor: '#F5D6DE' }]}>
                            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <TextInput
                            onChangeText={setThought}
                            placeholder="Suy nghĩ của bạn ..."
                            placeholderTextColor={Design.colors.disabled}
                            style={styles.composerInput}
                            value={thought}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Thêm ảnh"
                            hitSlop={8}
                            onPress={() => Alert.alert('Đăng ảnh', 'Tính năng sẽ được cập nhật sau.')}>
                            <Ionicons color={Design.colors.mutedText} name="image-outline" size={20} />
                        </Pressable>
                    </View>

                    {posts.map((post) => (
                        <View key={post.id} style={styles.postCard}>
                            <View style={styles.postHeader}>
                                <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
                                    <Text style={styles.avatarText}>{post.author.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.postAuthorWrap}>
                                    <Text style={styles.postAuthor}>{post.author}</Text>
                                    <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                                </View>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Tùy chọn bài viết"
                                    hitSlop={8}
                                    onPress={() => Alert.alert('Tùy chọn', 'Tính năng sẽ được cập nhật sau.')}>
                                    <Ionicons color={Design.colors.mutedText} name="ellipsis-horizontal" size={18} />
                                </Pressable>
                            </View>

                            <View style={styles.postImageWrap}>
                                <Image contentFit="cover" source={post.image} style={styles.postImage} />
                                {post.isVideo ? (
                                    <View style={styles.playButton}>
                                        <Ionicons color={Design.colors.white} name="play" size={22} />
                                    </View>
                                ) : null}
                            </View>

                            <Text style={styles.postCaption}>{post.caption}</Text>

                            <View style={styles.actionRow}>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => toggleHiFive(post.id)}
                                    style={[styles.actionChip, post.hiFived && styles.actionChipActive]}>
                                    <Text style={styles.actionEmoji}>🖐️</Text>
                                    {post.hiFives > 0 ? (
                                        <Text style={[styles.actionCount, post.hiFived && styles.actionCountActive]}>
                                            {post.hiFives}
                                        </Text>
                                    ) : null}
                                </Pressable>

                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => toggleCommentBox(post.id)}
                                    style={[
                                        styles.actionChip,
                                        openCommentPostId === post.id && styles.actionChipActive,
                                    ]}>
                                    <Ionicons
                                        color={Design.colors.black}
                                        name="chatbubble-outline"
                                        size={15}
                                    />
                                    {post.comments.length > 0 ? (
                                        <Text style={styles.actionCount}>{post.comments.length}</Text>
                                    ) : null}
                                </Pressable>
                            </View>

                            {post.comments.length > 0 ? (
                                <View style={styles.commentList}>
                                    {post.comments.map((comment, index) => (
                                        <View key={index} style={styles.commentRow}>
                                            <Text style={styles.commentAuthor}>{displayName}: </Text>
                                            <Text style={styles.commentText}>{comment}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            {openCommentPostId === post.id ? (
                                <View style={styles.commentComposer}>
                                    <TextInput
                                        autoFocus
                                        onChangeText={setCommentDraft}
                                        onSubmitEditing={() => submitComment(post.id)}
                                        placeholder="Viết bình luận..."
                                        placeholderTextColor={Design.colors.disabled}
                                        returnKeyType="send"
                                        style={styles.commentInput}
                                        value={commentDraft}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Gửi bình luận"
                                        hitSlop={8}
                                        onPress={() => submitComment(post.id)}>
                                        <Ionicons color={Design.colors.primaryGreen} name="send" size={18} />
                                    </Pressable>
                                </View>
                            ) : null}
                        </View>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.white,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
        marginBottom: 10,
    },
    backButton: {
        width: 32,
    },
    headerTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.black,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 28,
    },
    composer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 52,
        marginBottom: 16,
    },
    composerInput: {
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        paddingVertical: 0,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
    },
    postCard: {
        borderWidth: 1,
        borderColor: '#EDEDED',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        backgroundColor: Design.colors.white,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    postAuthorWrap: {
        flex: 1,
        marginLeft: 10,
    },
    postAuthor: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
    },
    postTimestamp: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption - 1,
        color: Design.colors.mutedText,
    },
    postImageWrap: {
        height: 210,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postImage: {
        ...StyleSheet.absoluteFillObject,
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    postCaption: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        lineHeight: 18,
        marginBottom: 10,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    actionChipActive: {
        borderColor: Design.colors.primaryGreen,
        backgroundColor: '#EAF4EE',
    },
    actionEmoji: {
        fontSize: 13,
    },
    actionCount: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
        color: Design.colors.black,
    },
    actionCountActive: {
        color: Design.colors.primaryGreen,
    },
    commentList: {
        marginTop: 10,
        gap: 5,
    },
    commentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    commentAuthor: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.black,
    },
    commentText: {
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.black,
    },
    commentComposer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
        marginTop: 10,
    },
    commentInput: {
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.black,
        paddingVertical: 0,
    },
});