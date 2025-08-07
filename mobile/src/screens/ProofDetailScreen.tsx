import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { trpc } from "../utils/trpc";

const ProofDetailScreen = ({ route }: any) => {
  const { proofId } = route.params;

  const { data: proof, isLoading, error } = trpc.proof.getById.useQuery({ id: proofId });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !proof) {
    return (
      <View style={styles.loadingContainer}>
        <Text>인증 피드를 불러오는 데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.nickname}>{proof.user.nickname}</Text>
            <Text style={styles.challengeTitle}>{proof.participation.challenge.title}</Text>
          </View>
        </View>
        <Image source={{ uri: proof.imageUrl }} style={styles.mainImage} />
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{proof.content}</Text>
          <Text style={styles.timestamp}>{new Date(proof.createdAt).toLocaleString()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  nickname: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  challengeTitle: { fontSize: 14, color: "#6B7280" },
  mainImage: { width: "100%", aspectRatio: 1 },
  contentContainer: { padding: 16 },
  content: { fontSize: 16, lineHeight: 24, color: "#374151", marginBottom: 12 },
  timestamp: { fontSize: 14, color: "#9CA3AF" },
});

export default ProofDetailScreen;
