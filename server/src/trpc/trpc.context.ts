import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { JwtService } from "@nestjs/jwt";

/**
 * 컨텍스트 생성 로직 및 타입 정의
 * Express의 요청 객체로부터 기본적인 컨텍스트를 생성
 */
export const createInnerTRPCContext = (opts: CreateExpressContextOptions) => {
  return {
    req: opts.req,
  };
};

/**
 * 위에서 만든 기본 컨텍스트에, DI로 주입될 서비스들을 포함한 최종 컨텍스트의 타입을 정의
 */
export type Context = Awaited<ReturnType<typeof createInnerTRPCContext>> & {
  jwtService: JwtService;
  user?: { userId: number; email: string };
};
