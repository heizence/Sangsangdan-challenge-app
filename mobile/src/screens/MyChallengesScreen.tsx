import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { trpc } from "../utils/trpc";
import { Ionicons } from "@expo/vector-icons";

// 데이터가 없을 때 보여줄 공통 컴포넌트
const EmptyListComponent = ({ message }: { message: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="list-outline" size={48} color="#D1D5DB" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// 챌린지 기간(일)을 계산하는 헬퍼 함수
const getTotalDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const MyChallengesScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<"inProgress" | "completed" | "failed">("inProgress");

  const { data: participations, isLoading, error } = trpc.my.getChallenges.useQuery();

  // API로 불러온 데이터를 선택된 탭에 따라 필터링합니다.
  const filteredData = useMemo(() => {
    if (!participations) return [];

    return participations.filter((p) => {
      const status = p.status; // 'IN_PROGRESS', 'COMPLETED', 'FAILED'

      if (activeTab === "inProgress") {
        return status === "IN_PROGRESS";
      }
      if (activeTab === "completed") {
        return status === "COMPLETED";
      }
      if (activeTab === "failed") {
        return status === "FAILED";
      }
      return false;
    });
  }, [participations, activeTab]);

  const renderItem = ({ item }: any) => {
    const totalDays = getTotalDays(item.challenge.startDate, item.challenge.endDate);
    const proofsCount = item.proofs?.length || 0; // 실제 인증 횟수
    const progress = totalDays > 0 ? proofsCount / totalDays : 0;

    const isSuccess = item.status === "COMPLETED";
    const isFailed = item.status === "FAILED";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => navigation.navigate("ChallengeDetail", { challengeId: item.challenge.id })}
      >
        <Image source={{ uri: item.challenge.thumbnail }} style={styles.thumbnail} />
        {/* 실패한 챌린지에만 어두운 오버레이 추가 */}
        {isFailed && <View style={styles.endedOverlay} />}

        <View style={styles.cardContent}>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, isFailed && styles.endedText]}>
              {item.challenge.title}
            </Text>
            {/* 성공적으로 완료한 경우 뱃지 표시 */}
            {isSuccess && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>성공!</Text>
              </View>
            )}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.progressText, isFailed && styles.endedText]}>
            인증 {proofsCount}회 / 총 {totalDays}일
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "inProgress" && styles.activeTab]}
          onPress={() => setActiveTab("inProgress")}
        >
          <Text style={[styles.tabText, activeTab === "inProgress" && styles.activeTabText]}>
            진행중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>
            성공
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "failed" && styles.activeTab]}
          onPress={() => setActiveTab("failed")}
        >
          <Text style={[styles.tabText, activeTab === "failed" && styles.activeTabText]}>실패</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<EmptyListComponent message={"해당하는 챌린지가 없습니다."} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 4 },
  activeTab: { backgroundColor: "#3498DB" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
  activeTabText: { color: "#FFFFFF" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  thumbnail: { width: "100%", height: 120, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
  },
  cardContent: { padding: 16 },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", flex: 1 },
  badge: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#1E40AF", fontSize: 12, fontWeight: "bold" },
  progressBarContainer: { height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, marginBottom: 4 },
  progressBar: { height: 8, backgroundColor: "#3498DB", borderRadius: 4 },
  progressText: { textAlign: "right", fontSize: 12, color: "#6B7280" },
  endedText: { color: "#E5E7EB" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 16, fontSize: 16, color: "#9CA3AF" },
});

export default MyChallengesScreen;
