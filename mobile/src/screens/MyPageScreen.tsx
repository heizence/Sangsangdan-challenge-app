import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { trpc } from "../utils/trpc";

const MyPageScreen = ({ navigation }: any) => {
  const { logout } = useContext(AuthContext);

  // tRPC 훅을 사용하여 데이터 비동기 호출
  const { data: user, isLoading: isProfileLoading } = trpc.my.getProfile.useQuery();
  const { data: myChallenges, isLoading: areChallengesLoading } = trpc.my.getChallenges.useQuery();
  const { data: myProofs, isLoading: areProofsLoading } = trpc.my.getProofs.useQuery();

  const isLoading = isProfileLoading || areChallengesLoading || areProofsLoading;

  const MenuItem = ({
    icon,
    text,
    value,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    value: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#4B5563" />
      <Text style={styles.menuText}>{text}</Text>
      <Text style={styles.menuValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498DB" />
          </View>
        ) : (
          <>
            <View style={styles.profileSection}>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png" }} // TODO: User 엔티티에 avatar 필드 추가 후 user.avatar로 변경
                style={styles.avatar}
              />
              <Text style={styles.nickname}>{user?.nickname}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.menuContainer}>
              <MenuItem
                icon="list-outline"
                text="나의 챌린지"
                value={`${myChallenges?.length || 0}개`}
                onPress={() => navigation.navigate("MyChallenges")}
              />
              <MenuItem
                icon="images-outline"
                text="나의 인증 피드"
                value={`${myProofs?.length || 0}개`}
                onPress={() => navigation.navigate("MyProofs")}
              />
            </View>
          </>
        )}

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  nickname: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  email: { fontSize: 16, color: "#6B7280", marginTop: 4 },
  menuContainer: { marginTop: 24 },
  menuItem: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuText: { flex: 1, marginLeft: 16, fontSize: 18, color: "#374151" },
  menuValue: { fontSize: 16, color: "#6B7280", marginRight: 8 },
  logoutButton: {
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FEE2E2",
  },
  logoutButtonText: { fontSize: 16, color: "#EF4444", fontWeight: "500" },
});

export default MyPageScreen;
