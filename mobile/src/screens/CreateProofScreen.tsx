import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getBaseUrl, trpc } from "../utils/trpc";
import { AuthContext } from "../context/AuthContext";
import apiClient from "@/utils/apiClient";

const CreateProofScreen = ({ navigation }: any) => {
  const { token } = useContext(AuthContext);
  const utils = trpc.useContext();

  const { data: myParticipations, isLoading: isLoadingChallenges } =
    trpc.my.getChallenges.useQuery();

  const [selectedParticipationId, setSelectedParticipationId] = useState<number | null>(null);
  const [selectedChallengeTitle, setSelectedChallengeTitle] =
    useState<string>("챌린지를 선택해주세요");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");

  const [pickerButtonLayout, setPickerButtonLayout] = useState(null);
  const pickerButtonRef = useRef(null);

  const createProofMutation = trpc.proof.create.useMutation({
    onSuccess: () => {
      Alert.alert("성공", "인증이 성공적으로 제출되었습니다.");
      utils.proof.getAll.invalidate();
      utils.my.getProofs.invalidate();
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert("오류", error.message || "인증 제출에 실패했습니다.");
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("사진을 업로드하려면 갤러리 접근 권한이 필요합니다.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedParticipationId) {
      Alert.alert("오류", "인증할 챌린지를 선택해주세요.");
      return;
    }
    if (!imageUri) {
      Alert.alert("오류", "인증 사진을 선택해주세요.");
      return;
    }
    if (!token) {
      Alert.alert("오류", "인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename!);
      const type = match ? `image/${match[1]}` : `image`;
      const formData = new FormData();
      formData.append("image", { uri: imageUri, name: filename, type } as any);

      const uploadResponse = await apiClient.post(`${getBaseUrl()}/uploads/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      //console.log("uploadResponse : ", uploadResponse);

      if (uploadResponse.status !== 201) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const imageUrl = uploadResponse.data.imageUrl;
      createProofMutation.mutate({ participationId: selectedParticipationId, content, imageUrl });
    } catch (error) {
      console.error("Error:", JSON.stringify(error, null, 2));
      // axios 외의 다른 오류
      Alert.alert("오류", error.message);
    }
  };

  const measurePickerButton = () => {
    pickerButtonRef.current.measure((fx, fy, width, height, px, py) => {
      setPickerButtonLayout({ px, py, width, height });
    });
  };

  const handleSelectChallenge = (participation: any) => {
    setSelectedParticipationId(participation.id);
    setSelectedChallengeTitle(participation.challenge.title);
    setIsPickerOpen(false);
  };

  if (isLoadingChallenges) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          ref={pickerButtonRef}
          style={styles.pickerContainer}
          onPress={() => {
            measurePickerButton();
            setIsPickerOpen(true);
          }}
        >
          <Text style={styles.pickerText}>{selectedChallengeTitle}</Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
              <Text style={styles.imagePickerText}>인증 사진 선택하기</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="오늘의 인증 소감을 남겨주세요."
          multiline
          value={content}
          onChangeText={setContent}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            createProofMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createProofMutation.isPending}
        >
          {createProofMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>제출하기</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isPickerOpen}
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsPickerOpen(false)}>
          {pickerButtonLayout && (
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: pickerButtonLayout.py + pickerButtonLayout.height,
                  left: pickerButtonLayout.px,
                  width: pickerButtonLayout.width,
                },
              ]}
            >
              {myParticipations?.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectChallenge(p)}
                >
                  <Text>{p.challenge.title}</Text>
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
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pickerText: { fontSize: 16, fontWeight: "500" },
  imagePicker: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePickerPlaceholder: { alignItems: "center" },
  imagePickerText: { marginTop: 8, color: "#6B7280", fontSize: 16 },
  imagePreview: { width: "100%", height: "100%" },
  textInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  submitButton: { backgroundColor: "#3498DB", padding: 16, borderRadius: 12, alignItems: "center" },
  submitButtonDisabled: { backgroundColor: "#AECBFA" },
  submitButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  modalOverlay: { flex: 1 },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
});

export default CreateProofScreen;
