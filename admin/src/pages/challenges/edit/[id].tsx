import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import { useAuth } from "../../../context/AuthContext";

const FormRow = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-4">
    <label className="font-semibold text-gray-700 text-base mt-2">{label}</label>
    <div className="md:col-span-3">{children}</div>
  </div>
);

const EditChallengePage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { token } = useAuth();
  const { id } = router.query;
  const challengeId = Number(id);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: "",
    frequency: "",
    authCountPerDay: "",
    startDate: "",
    endDate: "",
    authDescription: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalThumbnail, setOriginalThumbnail] = useState("");

  // 기존 챌린지 데이터 불러오기
  const { data: challengeData, isLoading } = trpc.challenge.getById.useQuery(
    { id: challengeId },
    { enabled: !!id }
  );

  // 데이터 로딩 완료 시 폼 상태 초기화
  useEffect(() => {
    if (challengeData) {
      setFormData({
        title: challengeData.title,
        frequency: challengeData.frequency,
        authCountPerDay: challengeData.authCountPerDay,
        startDate: new Date(challengeData.startDate).toISOString().split("T")[0],
        endDate: new Date(challengeData.endDate).toISOString().split("T")[0],
        authDescription: challengeData.authDescription,
      });
      setImagePreview(challengeData.thumbnail);
      setOriginalThumbnail(challengeData.thumbnail);
    }
  }, [challengeData]);

  // 챌린지 수정을 위한 tRPC 뮤테이션
  const updateChallenge = trpc.admin.challenge.update.useMutation({
    onSuccess: () => {
      utils.challenge.getAll.invalidate(); // 목록 캐시 갱신
      utils.challenge.getById.invalidate({ id: challengeId }); // 상세 정보 캐시 갱신
      alert("변경사항이 저장되었습니다.");
      router.push(`/challenges/${challengeId}`);
    },
    onError: (error) => {
      alert(`수정 실패: ${error.message}`);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedImageUrl = originalThumbnail;

    try {
      // 이미지가 새로 첨부된 경우에만 업로드
      if (imageFile) {
        if (!token) throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");

        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageFormData,
        });

        if (!uploadResponse.ok) throw new Error("이미지 업로드 실패");

        const uploadResult = await uploadResponse.json();
        uploadedImageUrl = uploadResult.imageUrl;
      }

      // tRPC로 챌린지 수정 요청
      updateChallenge.mutate({
        id: challengeId,
        ...formData,
        thumbnail: uploadedImageUrl,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    } catch (error) {
      alert(error.message);
    }
  };

  if (isLoading)
    return (
      <Layout pageTitle="로딩 중...">
        <p className="text-center">데이터를 불러오는 중...</p>
      </Layout>
    );

  return (
    <Layout pageTitle={`챌린지 #${id} 수정`}>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormRow label="챌린지 제목">
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-50 border rounded-md"
            />
          </FormRow>
          <FormRow label="썸네일 이미지">
            <div className="flex items-center space-x-4">
              <img
                src={imagePreview}
                alt="썸네일 미리보기"
                className="w-64 h-64 object-cover rounded-md bg-gray-100"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </FormRow>
          <FormRow label="인증 빈도">
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-50 border rounded-md"
            >
              <option>매일</option>
              <option>평일</option>
              <option>주말</option>
              <option>주 1회</option>
            </select>
          </FormRow>
          <FormRow label="하루 인증 횟수">
            <select
              name="authCountPerDay"
              value={formData.authCountPerDay}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-50 border rounded-md"
            >
              <option>하루 1회</option>
              <option>제한 없음 (다회)</option>
            </select>
          </FormRow>
          <FormRow label="기간 설정">
            <div className="flex items-center space-x-4">
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border rounded-md"
              />
              <span className="text-gray-500">~</span>
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border rounded-md"
              />
            </div>
          </FormRow>
          <FormRow label="인증 방법 설명">
            <textarea
              name="authDescription"
              value={formData.authDescription}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-2 bg-gray-50 border rounded-md"
            ></textarea>
          </FormRow>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={updateChallenge.isPending}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updateChallenge.isPending ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditChallengePage;
