import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { AuthProvider } from "../context/AuthContext";

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL + "/trpc",
          // 👇 [수정] 모든 tRPC 요청에 인증 헤더를 추가하는 로직
          headers() {
            if (typeof window !== "undefined") {
              const token = localStorage.getItem("admin_token");
              return token ? { Authorization: `Bearer ${token}` } : {};
            }
            return {};
          },
        }),
      ],
    })
  );

  return (
    <AuthProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </trpc.Provider>
    </AuthProvider>
  );
}

export default App;
