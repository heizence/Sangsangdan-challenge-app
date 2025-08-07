import axios from "axios";
import { getBaseUrl } from "./trpc"; // 기존 getBaseUrl 함수 재사용

// 재시도 로직이 적용된 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: getBaseUrl(),
});

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  // 성공적인 응답은 그대로 반환
  (response) => response,
  // 에러 발생 시 처리
  async (error) => {
    const originalRequest = error.config;

    // 1. 네트워크 에러이고, 아직 재시도한 적이 없다면
    if (error.code === "ERR_NETWORK" && !originalRequest._retry) {
      console.log("네트워크 오류 발생. 1초 후 재시도합니다...");
      originalRequest._retry = true; // 재시도 플래그 설정

      // 2. 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. 원래 요청을 다시 실행
      return apiClient(originalRequest);
    }

    // 4. 네트워크 에러가 아니거나, 이미 재시도한 경우 에러를 그대로 반환
    return Promise.reject(error);
  }
);

export default apiClient;
