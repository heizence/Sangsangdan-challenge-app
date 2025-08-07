import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChallengeListScreenProps } from "../types/navigation";
import { trpc } from "../utils/trpc";
import { dateFormatter } from "@/utils/tools";

const ChallengesExample = [
  {
    id: 1,
    title: "미라클 모닝 30일 챌린지",
    thumbnail:
      "https://images.unsplash.com/photo-1518602164578-cD3476171452?q=80&w=2940&auto=format&fit=crop",
    period: "25.08.01 ~ 25.08.30",
    participants: 128,
  },
];

const EmptyListComponent = ({ message }: { message: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="compass-outline" size={48} color="#D1D5DB" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const FILTER_MAP = {
  전체: "all",
  모집중: "recruiting",
  예정: "upcoming",
  종료: "ended",
};
const FILTER_OPTIONS = ["전체", "모집중", "예정", "종료"];

const ChallengeListScreen: React.FC<ChallengeListScreenProps> = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterButtonLayout, setFilterButtonLayout] = useState(null); // 👇 [추가] 버튼 위치 저장을 위한 상태
  const filterButtonRef = useRef(null); // 👇 [추가] 버튼 참조를 위한 ref

  const {
    data: challenges,
    isLoading,
    error,
  } = trpc.challenge.getAll.useQuery({
    filter: FILTER_MAP[selectedFilter],
  });

  const handleSelectFilter = (option: string) => {
    setSelectedFilter(option);
    setIsFilterOpen(false);
  };

  // 필터 버튼의 위치를 측정하는 함수
  const measureFilterButton = () => {
    filterButtonRef.current.measure((fx, fy, width, height, px, py) => {
      setFilterButtonLayout({ px, py, height });
    });
  };

  const renderItem = ({ item }: { item: (typeof ChallengesExample)[0] }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => navigation.navigate("ChallengeDetail", { challengeId: item.id })}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardInfo}>
            {dateFormatter(item.startDate)} ~ {dateFormatter(item.endDate)}
          </Text>
          <Text style={styles.cardInfo}>{item.participants?.length || 0}명 참여중</Text>
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
      <FlatList
        data={challenges}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.container}
        contentContainerStyle={styles.listContentContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>챌린지</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              ref={filterButtonRef}
              style={styles.filterDropdown}
              onPress={() => {
                measureFilterButton(); // 버튼 위치 측정
                setIsFilterOpen(true); // 모달 열기
              }}
            >
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Ionicons name={"chevron-down"} size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={<EmptyListComponent message="표시할 챌린지가 없습니다." />}
      />

      <Modal
        transparent={true}
        visible={isFilterOpen}
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterOpen(false)}>
          {filterButtonLayout && (
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: filterButtonLayout.py + filterButtonLayout.height + 5,
                  right: 16,
                },
              ]}
            >
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={option}
                  style={[
                    styles.dropdownItem,
                    selectedFilter === option && styles.selectedDropdownItem,
                  ]}
                  onPress={() => handleSelectFilter(option)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedFilter === option && styles.selectedDropdownItemText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  listContentContainer: { paddingBottom: 24, flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  filterDropdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: { fontSize: 16, fontWeight: "500", color: "#4B5563", marginRight: 4 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  thumbnail: { width: "100%", height: 160, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#1F2937" },
  cardInfo: { fontSize: 14, color: "#6B7280", marginBottom: 4 },

  // --- Modal & Dropdown Styles ---
  modalOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    width: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedDropdownItem: {
    backgroundColor: "#EFF6FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedDropdownItemText: {
    fontWeight: "600",
    color: "#2563EB",
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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

export default ChallengeListScreen;
