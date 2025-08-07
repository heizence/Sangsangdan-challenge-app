import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";

const LoadingOverlay = ({ text = "불러오는 중..." }: { text?: string }) => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#3498DB" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    // 부모 컴포넌트를 완전히 덮도록 설정
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // 다른 UI 요소들 위에 표시되도록 z-index 설정
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#3498DB",
    fontWeight: "500",
  },
});

export default LoadingOverlay;
