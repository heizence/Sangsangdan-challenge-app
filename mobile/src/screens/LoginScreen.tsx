import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { LoginScreenProps } from "../types/navigation";
import { trpc } from "../utils/trpc";
import { jwtDecode } from "jwt-decode";

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { login } = useContext(AuthContext);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      login(data.access_token);
    },
    onError: (error) => {
      Alert.alert("로그인 실패", error.message || "알 수 없는 오류가 발생했습니다.");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>꿈을 향해 나아가는 사람들</Text>
          <Text style={styles.logo}>상상단</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>이메일 주소</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일 주소 입력"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loginMutation.isPending && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>로그인</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 48 },
  title: { fontSize: 16, color: "#333333", marginBottom: 8 },
  logo: { fontSize: 40, fontWeight: "bold", color: "#3498DB" },
  form: { marginBottom: 24 },
  label: { fontSize: 14, color: "#8E8E93", marginBottom: 8 },
  input: {
    backgroundColor: "#F2F2F7",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: { position: "relative", justifyContent: "center" },
  eyeIcon: { position: "absolute", right: 16 },
  loginButton: {
    backgroundColor: "#3498DB",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#AECBFA",
  },
  loginButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});

export default LoginScreen;
