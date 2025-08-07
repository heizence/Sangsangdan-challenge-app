import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/trpc/trpc.router";
import { Platform } from "react-native";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getBaseUrl = () => {
  return `${process.env.EXPO_PUBLIC_API_URL}`;
};

export const trpc = createTRPCReact<AppRouter>();

// httpBatchLink를 생성하는 함수를 export합니다.
export const createTrpcLink = (token: string | null) => {
  return httpBatchLink({
    url: `${getBaseUrl()}/trpc`,
    headers() {
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      async headers() {
        const token = await AsyncStorage.getItem("user_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
