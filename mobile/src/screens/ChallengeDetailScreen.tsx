import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChallengeDetailScreenProps } from "../types/navigation";
import { trpc } from "../utils/trpc";
import { AuthContext } from "../context/AuthContext";
import { dateFormatter } from "@/utils/tools";

const ChallengeDetailScreen: React.FC<ChallengeDetailScreenProps> = ({ route }) => {
  const { challengeId } = route.params;
  const { userId } = useContext(AuthContext);
  const utils = trpc.useContext();

  // 챌린지 상세 정보 불러오기
  const {
    data: challenge,
    isLoading: isChallengeLoading,
    error: challengeError,
  } = trpc.challenge.getById.useQuery({ id: challengeId });

  //  내가 참여한 챌린지 목록을 불러와서 현재 챌린지 참여 여부를 확인
  const { data: myParticipations, isLoading: isMyChallengesLoading } =
    trpc.my.getChallenges.useQuery();

  // 챌린지 참여하기
  const joinMutation = trpc.challenge.join.useMutation({
    onSuccess: () => {
      Alert.alert("참여 완료", "챌린지 참여가 완료되었습니다.");
      // 나의 챌린지 목록을 새로고침하여 즉시 반영되도록 합니다.
      utils.my.getChallenges.invalidate();
    },
    onError: (err) => {
      Alert.alert("참여 실패", err.message || "오류가 발생했습니다.");
    },
  });

  // 👇 [추가] 현재 챌린지에 이미 참여했는지 여부를 계산
  const isAlreadyJoined = useMemo(() => {
    if (!myParticipations) return false;
    return myParticipations.some((p) => p.challenge.id === challengeId);
  }, [myParticipations, challengeId]);

  const handleJoin = () => {
    if (!userId) {
      Alert.alert("오류", "로그인 정보가 없습니다.");
      return;
    }
    Alert.alert("챌린지 참여", `'${challenge?.title}' 챌린지에 참여하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      { text: "참여", onPress: () => joinMutation.mutate({ challengeId }) },
    ]);
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#8E8E93" style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const isLoading = isChallengeLoading || isMyChallengesLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (challengeError || !challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text>챌린지 정보를 불러오는 데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Image source={{ uri: challenge.thumbnail }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{challenge.title}</Text>

          <View style={styles.infoBox}>
            <InfoRow
              icon="calendar-outline"
              label="챌린지 기간"
              value={`${dateFormatter(challenge.startDate)} ~ ${dateFormatter(challenge.endDate)}`}
            />
            <InfoRow icon="repeat-outline" label="인증 빈도" value={challenge.frequency} />
            <InfoRow icon="camera-outline" label="인증 횟수" value={challenge.authCountPerDay} />
          </View>

          <Text style={styles.sectionTitle}>인증 방법</Text>
          <Text style={styles.authMethod}>{challenge.authDescription}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {isAlreadyJoined ? (
          // 이미 참여한 경우 보여줄 버튼
          <View style={[styles.joinButton, styles.joinedButton]}>
            <Text style={styles.joinedButtonText}>참여중인 챌린지</Text>
          </View>
        ) : (
          // 기존 참여하기 버튼
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.joinButton, joinMutation.isPending && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>참여하기</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 250 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#1F2937" },
  infoBox: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  infoIcon: { marginRight: 12 },
  infoLabel: { fontSize: 16, color: "#6B7280", width: 100 },
  infoValue: { fontSize: 16, color: "#1F2937", fontWeight: "500", flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937", marginBottom: 8 },
  authMethod: { fontSize: 16, color: "#4B5563", lineHeight: 24 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#fff" },
  joinButton: {
    backgroundColor: "#3498DB",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonDisabled: { backgroundColor: "#AECBFA" },
  joinButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },

  joinedButton: {
    backgroundColor: "#E5E7EB",
  },
  joinedButtonText: {
    color: "#6B7280",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChallengeDetailScreen;
