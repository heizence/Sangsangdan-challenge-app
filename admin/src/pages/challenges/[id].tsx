import React from "react";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import { trpc } from "../../utils/trpc";

// 날짜/시간 포맷을 위한 유틸리티 함수
const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const formattedTime = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }); // AM/PM 시간
  return `${formattedDate} ${formattedTime}`;
};

const ChallengeDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const utils = trpc.useContext();
  const challengeId = Number(id); // URL 파라미터는 문자열이므로 숫자로 변환

  const {
    data: challenge,
    isLoading,
    error,
  } = trpc.challenge.getById.useQuery(
    { id: challengeId },
    {
      // id가 존재할 때만 쿼리를 실행하도록 설정 (페이지 첫 렌더링 시 id는 undefined일 수 있음)
      enabled: !!id,
    }
  );

  // [추가] 챌린지 삭제를 위한 tRPC 뮤테이션
  const deleteChallenge = trpc.admin.challenge.delete.useMutation({
    onSuccess: () => {
      utils.challenge.getAll.invalidate(); // 목록 캐시 무효화
      alert("챌린지가 삭제되었습니다.");
      router.push("/"); // 목록 페이지로 이동
    },
    onError: (error) => {
      alert(`삭제 실패: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (window.confirm(`ID: ${challengeId} 챌린지를 정말 삭제하시겠습니까?`)) {
      deleteChallenge.mutate({ id: challengeId });
    }
  };

  const DetailItem = ({ label, value }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-base font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
  );

  // 로딩 및 에러 상태 처리
  if (isLoading) {
    return (
      <Layout pageTitle="로딩 중...">
        <p className="text-center">챌린지 정보를 불러오는 중...</p>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout pageTitle="오류">
        <p className="text-center text-red-500">오류가 발생했습니다: {error.message}</p>
      </Layout>
    );
  }
  // 데이터가 없는 경우 처리
  if (!challenge) {
    return (
      <Layout pageTitle="정보 없음">
        <p className="text-center">해당 챌린지 정보를 찾을 수 없습니다.</p>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={`챌린지 #${id} 상세 정보`}>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl leading-6 font-medium text-gray-900">챌린지 상세 정보</h3>
            <p className="mt-1 max-w-2xl text-base text-gray-500">
              챌린지의 모든 세부 정보를 확인합니다.
            </p>
          </div>
          <div className="space-x-3">
            <Link
              href={`/challenges/edit/${id}`}
              className="px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              수정하기
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteChallenge.isPending}
              className="px-4 py-2 text-base font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {deleteChallenge.isPending ? "삭제 중..." : "삭제하기"}
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-base font-medium text-gray-500">썸네일 이미지</dt>
              <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">
                <img
                  src={challenge.thumbnail}
                  alt="썸네일"
                  className="w-full max-w-lg h-auto rounded-md object-contain bg-gray-50"
                />
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem label="챌린지 제목" value={challenge.title} />
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem label="인증 빈도" value={challenge.frequency} />
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem
                label="기간"
                value={`${new Date(challenge.startDate).toISOString().split("T")[0]} ~ ${
                  new Date(challenge.endDate).toISOString().split("T")[0]
                }`}
              />
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem label="하루 인증 횟수" value={challenge.authCountPerDay} />
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem label="인증 방법 설명" value={challenge.authDescription} />
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem label="생성일" value={formatDateTime(challenge.createdAt)} />
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <DetailItem label="최종 수정일" value={formatDateTime(challenge.updatedAt)} />
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  );
};

export default ChallengeDetailPage;
