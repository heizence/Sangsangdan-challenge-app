import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/trpc/trpc.router";

export const trpc = createTRPCReact<AppRouter>();
