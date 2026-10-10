import { Design } from "@/src/constants/design";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { styles } from "../community.styles";
import type { FriendSuggestionsSectionProps } from "../types/community";
import { FriendSuggestionCard } from "./friend-suggestion-card";

export function FriendSuggestionsSection({
  suggestions,
  isLoading,
  sendingFriendRequestId,
  onSuggestionPress,
  onAddFriend,
}: FriendSuggestionsSectionProps) {
  return (
    <View style={styles.suggestionsSection}>
      <View style={styles.suggestionsHeader}>
        <View>
          <Text style={styles.suggestionsTitle}>Gợi ý kết bạn</Text>
          <Text style={styles.suggestionsSubtitle}>People you may know</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
        ) : null}
      </View>
      {!isLoading && suggestions.length > 0 ? (
        <ScrollView
          contentContainerStyle={styles.suggestionsList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {suggestions.map((suggestion) => (
            <FriendSuggestionCard
              key={suggestion.userId}
              isSending={sendingFriendRequestId === suggestion.userId}
              onAddFriend={() => onAddFriend(suggestion.userId)}
              onPress={() => onSuggestionPress(suggestion.userId)}
              suggestion={suggestion}
            />
          ))}
        </ScrollView>
      ) : !isLoading ? (
        <Text style={styles.noSuggestionsText}>
          Hiện chưa có gợi ý kết bạn mới.
        </Text>
      ) : null}
    </View>
  );
}
