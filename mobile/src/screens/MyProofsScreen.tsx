import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "../utils/trpc";

const EmptyListComponent = ({ message }: { message: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="information-circle-outline" size={48} color="#D1D5DB" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 2;

const MyProofsScreen = ({ navigation }: any) => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const { data: myProofs, isLoading, error } = trpc.my.getProofs.useQuery();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setViewType("list")} style={styles.headerButton}>
            <Ionicons name="list" size={24} color={viewType === "list" ? "#3498DB" : "#AAB8C2"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewType("grid")} style={styles.headerButton}>
            <Ionicons name="grid" size={22} color={viewType === "grid" ? "#3498DB" : "#AAB8C2"} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, viewType]);

  const renderListItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProofDetail", { proofId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
      <View style={styles.cardContent}>
        <Text style={styles.challengeTitle}>{item.participation.challenge.title}</Text>
        <Text style={styles.content} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: any) => (
    <TouchableOpacity
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
        data={myProofs}
        renderItem={viewType === "list" ? renderListItem : renderGridItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewType === "grid" ? NUM_COLUMNS : 1}
        style={styles.container}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={<EmptyListComponent message="아직 작성한 인증 피드가 없습니다." />}
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  listContentContainer: { flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerButtons: { flexDirection: "row", marginRight: 16 },
  headerButton: { marginLeft: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  listImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  cardContent: { flex: 1 },
  challengeTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  content: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  timestamp: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
  },
  gridImage: { width: "100%", height: "100%" },

  // --- Empty Component Styles ---
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9CA3AF",
  },
});

export default MyProofsScreen;
