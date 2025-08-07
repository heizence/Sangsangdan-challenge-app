import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProofFeedScreenProps } from "../types/navigation";
import { trpc } from "../utils/trpc";

const EmptyListComponent = ({ message }: { message: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="checkmark-done-circle-outline" size={48} color="#D1D5DB" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 2;

const ProofFeedScreen: React.FC<ProofFeedScreenProps> = ({ navigation }) => {
  const [viewType, setViewType] = useState<"list" | "grid">("list");

  // tRPC 훅을 사용하여 전체 인증 피드 목록을 불러옵니다.
  const { data: proofs, isLoading, error } = trpc.proof.getAll.useQuery({});

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewType("list")}
            style={styles.headerButton}
          >
            <Ionicons name="list" size={24} color={viewType === "list" ? "#3498DB" : "#AAB8C2"} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewType("grid")}
            style={styles.headerButton}
          >
            <Ionicons name="grid" size={22} color={viewType === "grid" ? "#3498DB" : "#AAB8C2"} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, viewType]);

  const renderListItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.nickname}>{item.user.nickname}</Text>
          <Text style={styles.challengeTitle}>{item.participation.challenge.title}</Text>
        </View>
      </View>
      <View>
        <Image source={{ uri: item.imageUrl }} style={styles.mainImage} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderGridItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.gridItem}
      onPress={() => navigation.navigate("ProofDetail", { proofId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>오류: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        key={viewType}
        data={proofs}
        renderItem={viewType === "list" ? renderListItem : renderGridItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewType === "grid" ? 3 : 1}
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<EmptyListComponent message="아직 등록된 인증 피드가 없습니다." />}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.getParent()?.getParent()?.navigate("CreateProof")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerButtons: { flexDirection: "row", marginRight: 16 },
  headerButton: { marginLeft: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  nickname: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  challengeTitle: { fontSize: 14, color: "#6B7280" },
  mainImage: { width: "100%", height: 400 },
  cardFooter: { padding: 12 },
  content: { fontSize: 16, color: "#374151", marginBottom: 8 },
  timestamp: { fontSize: 12, color: "#9CA3AF" },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
  },
  gridImage: { width: "100%", height: "100%" },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498DB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 16, fontSize: 16, color: "#9CA3AF" },
});

export default ProofFeedScreen;
