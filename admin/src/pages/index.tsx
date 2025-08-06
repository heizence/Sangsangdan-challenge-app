// admin/src/pages/index.tsx (챌린지 목록 페이지 API 연동)
import React from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

/**
 * 챌린지 상태를 날짜 기준으로 계산하는 헬퍼 함수
 * @param startDate - 챌린지 시작일
 * @param endDate - 챌린지 종료일
 * @returns { text: string, className: string } - 상태 텍스트와 Tailwind CSS 클래스
 */
const getChallengeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (now < start) {
    return { text: "예정", className: "bg-yellow-100 text-yellow-800" };
  } else if (now > end) {
    return { text: "종료", className: "bg-red-100 text-red-800" };
  } else {
    return { text: "진행중", className: "bg-green-100 text-green-800" };
  }
};

/**
 * Date 객체나 ISO 문자열을 'YYYY-MM-DD' 형식으로 변환하는 함수
 * @param date - 변환할 날짜
 * @returns {string} - 포맷된 날짜 문자열
 */
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const ChallengeListPage = () => {
  const router = useRouter();
  const utils = trpc.useContext();

  // 👇 [수정] useQuery에 빈 객체({})를 인자로 전달합니다.
  const { data: challenges, isLoading, error } = trpc.challenge.getAll.useQuery({});

  // [추가] 챌린지 삭제를 위한 tRPC 뮤테이션 훅
  const deleteChallenge = trpc.admin.challenge.delete.useMutation({
    onSuccess: () => {
      utils.challenge.getAll.invalidate(); // 삭제 성공 시 목록 캐시를 무효화하여 새로고침
      alert("삭제되었습니다.");
    },
    onError: (error) => {
      alert(`삭제에 실패했습니다: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm(`ID: ${id} 챌린지를 정말 삭제하시겠습니까?`)) {
      deleteChallenge.mutate({ id });
    }
  };

  const handleRowClick = (id: number) => {
    router.push(`/challenges/${id}`);
  };

  return (
    <Layout pageTitle="챌린지 관리">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">전체 챌린지 목록</h2>
          <Link
            href="/challenges/new"
            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + 새 챌린지 생성
          </Link>
        </div>
        <div className="overflow-x-auto">
          {isLoading && <p className="text-center py-4">목록을 불러오는 중...</p>}
          {error && (
            <p className="text-center py-4 text-red-500">오류가 발생했습니다: {error.message}</p>
          )}
          {!isLoading && !error && (
            <table className="min-w-full text-base text-left text-gray-600">
              <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    챌린지 제목
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    시작일
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    종료일
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {challenges?.map((challenge) => {
                  const status = getChallengeStatus(challenge.startDate, challenge.endDate);
                  return (
                    <tr
                      key={challenge.id}
                      className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(challenge.id)}
                    >
                      <td className="px-6 py-4 text-center">{challenge.id}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{challenge.title}</td>
                      <td className="px-6 py-4 text-center">{formatDate(challenge.startDate)}</td>
                      <td className="px-6 py-4 text-center">{formatDate(challenge.endDate)}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 text-sm font-semibold rounded-full ${status.className}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2 text-center">
                        <Link
                          href={`/challenges/edit/${challenge.id}`}
                          className="font-medium text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          수정
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(challenge.id);
                          }}
                          disabled={deleteChallenge.isPending}
                          className="font-medium text-red-600 hover:underline disabled:text-gray-400"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChallengeListPage;
