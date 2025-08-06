import { useState, useEffect } from "react";

// 폼의 props 타입 정의
interface ChallengeFormProps {
  initialData?: {
    title: string;
    // ... 다른 필드들
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function ChallengeForm({ initialData, onSubmit, isSubmitting }: ChallengeFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    thumbnail: "",
    frequency: "DAILY",
    startDate: "",
    endDate: "",
    authMethod: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData as any);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}
    >
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="챌린지 제목"
        required
      />
      <input
        name="thumbnail"
        value={formData.thumbnail}
        onChange={handleChange}
        placeholder="썸네일 URL"
        required
      />
      <input
        name="authMethod"
        value={formData.authMethod}
        onChange={handleChange}
        placeholder="인증 방법"
        required
      />
      <select name="frequency" value={formData.frequency} onChange={handleChange}>
        <option value="DAILY">매일</option>
        <option value="WEEKDAY">평일</option>
        <option value="WEEKEND">주말</option>
      </select>
      <input
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        required
      />
      <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "처리 중..." : "저장하기"}
      </button>
    </form>
  );
}
