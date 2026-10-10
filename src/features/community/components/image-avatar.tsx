import React, { useState } from "react";
import { Image } from "expo-image";
import { styles } from "../community.styles";
import type { ImageAvatarProps } from "../types/community";

export function ImageAvatar({ source, fallback }: ImageAvatarProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Image
        accessibilityLabel={`Ảnh đại diện của ${fallback}`}
        contentFit="cover"
        source={require("@/assets/images/onboarding/cat-luna.png")}
        style={styles.avatarImage}
      />
    );
  }

  return (
    <Image
      accessibilityLabel="Ảnh đại diện"
      cachePolicy="none"
      contentFit="cover"
      onError={() => setHasError(true)}
      source={{ uri: source }}
      style={styles.avatarImage}
    />
  );
}
