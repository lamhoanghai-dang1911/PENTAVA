import React from "react";
import { View, Text, Image } from "react-native";
import { styles } from "../subscription.styles";

export function SubscriptionBanner() {
  return (
    <View style={styles.bannerCard}>
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerTitle}>
          Trở thành hội viên nhận nhiều đặc quyền siêu hấp dẫn!
        </Text>
      </View>
      <Image
        source={require("@/assets/images/onboarding/luna-smile.jpg")}
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </View>
  );
}
