import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { trpc } from "../../utils/trpc";

const FormRow = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-4">
    <label className="font-semibold text-gray-700 text-base mt-2">{label}</label>
    <div className="md:col-span-3">{children}</div>
  </div>
);

const NewChallengePage = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { token } = useAuth();

  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    title: "",
    frequency: "매일",
    authCountPerDay: "하루 1회",
    startDate: "",
    endDate: "",
    authDescription: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // tRPC 뮤테이션 훅
  const createChallenge = trpc.admin.challenge.create.useMutation({
    onSuccess: () => {
      utils.challenge.getAll.invalidate();
      alert("새 챌린지가 성공적으로 생성되었습니다.");
      router.push("/");
    },
    onError: (error) => {
      console.error(error.message);
      alert(`챌린지 생성에 실패했습니다: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
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

    if (!imageFile) {
      alert("썸네일 이미지를 첨부해주세요.");
      return;
    }
    if (!token) {
      alert("인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      // --- 이미지 업로드 요청 부분 ---
      const imageFormData = new FormData();
      imageFormData.append("image", imageFile);

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/image`, {
        method: "POST",
        headers: {
          // 로그인 시 발급받은 토큰을 Bearer 형식으로 헤더에 추가합니다.
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      });
      // --- ---

      if (!uploadResponse.ok) {
        if (uploadResponse.status === 401) {
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
        }
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const uploadResult = await uploadResponse.json();
      const uploadedImageUrl = uploadResult.imageUrl;

      // 이후 챌린지 생성 tRPC API 호출...
      createChallenge.mutate({
        ...formData,
        thumbnail: uploadedImageUrl,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Layout pageTitle="새 챌린지 생성">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormRow label="챌린지 제목">
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="예: 미라클 모닝"
              className="w-full px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              required
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
              className="w-full px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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
              className="w-full px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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
                className="w-full px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
              />
              <span className="text-gray-500">~</span>
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
              />
            </div>
          </FormRow>
          <FormRow label="인증 방법 설명">
            <textarea
              name="authDescription"
              value={formData.authDescription}
              onChange={handleInputChange}
              rows={5}
              placeholder="예: 기상 직후 이불 정리 사진 올리기"
              className="w-full px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              required
            ></textarea>
          </FormRow>
          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/"
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 text-base"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={createChallenge.isPending}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 text-base disabled:bg-gray-400"
            >
              {createChallenge.isPending ? "생성 중..." : "생성하기"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewChallengePage;
