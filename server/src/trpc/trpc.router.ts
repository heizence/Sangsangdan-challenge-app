import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { ChallengesService } from "../challenges/challenges.service";
import { UsersService } from "../users/users.service";
import { AuthService } from "../auth/auth.service";
import { ProofsService } from "src/proofs/proofs.service";
import { Context } from "./trpc.context";

const createChallengeSchema = z.object({
  title: z.string().min(1),
  thumbnail: z.string().url(),
  frequency: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  authCountPerDay: z.string(),
  authDescription: z.string(),
});

const updateChallengeSchema = createChallengeSchema.partial();

/**
 * tRPC 라우터를 초기화하고, 서비스들을 주입받아 API 엔드포인트를 정의합니다.
 * @param challengesService 챌린지 관련 비즈니스 로직
 * @param proofsService 챌린지 인증 관련 비즈니스 로직
 * @param usersService 사용자 관련 비즈니스 로직
 * @param authService 인증 관련 비즈니스 로직
 * @returns tRPC AppRouter
 */
export function appRouter(
  challengesService: ChallengesService,
  proofsService: ProofsService,
  usersService: UsersService,
  authService: AuthService
) {
  const t = initTRPC.context<Context>().create();
  const publicProcedure = t.procedure; // 인증이 필요 없는 프로시저
  const router = t.router;

  // 앱 인증 확인 미들웨어
  const isAuthed = t.middleware(async ({ ctx, next }) => {
    const authHeader = ctx.req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const payload = await ctx.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      ctx.user = { userId: payload.sub, email: payload.email, role: payload.role };
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user!,
      },
    });
  });

  // 관리자 역할(role)을 확인하는 미들웨어
  const isAdmin = isAuthed.unstable_pipe(async ({ ctx, next }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다." });
    }
    return next({ ctx });
  });

  // 인증된 사용자만 접근할 수 있는 프로시저 생성
  const protectedProcedure = t.procedure.use(isAuthed);

  // 관리자만 접근할 수 있는 프로시저 생성
  const adminProcedure = t.procedure.use(isAdmin);

  return router({
    // --- 사용자 인증 라우터 ---
    auth: router({
      signUp: publicProcedure
        .input(
          z.object({
            email: z.string().email("올바른 이메일 형식이 아닙니다."),
            password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
            nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
          })
        )
        .mutation(({ input }) => {
          const { email, password, nickname } = input;
          return usersService.createUser({ email, password, nickname });
        }),

      login: publicProcedure
        .input(z.object({ email: z.string().email(), password: z.string() }))
        .mutation(async ({ input }) => {
          const user = await authService.validateUser(input.email, input.password);
          if (!user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "이메일 또는 비밀번호가 올바르지 않습니다.",
            });
          }
          return authService.login(user);
        }),
    }),

    // --- 챌린지 탐색 및 참여 라우터 ---
    challenge: router({
      getAll: publicProcedure
        .input(
          z.object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(20),
            filter: z.enum(["all", "recruiting", "upcoming", "ended"]).optional().default("all"),
          })
        )
        .query(({ input }) => {
          const { page, limit, filter } = input;
          return challengesService.findAllChallenges({ page, limit, filter });
        }),

      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => challengesService.findChallengeById(input.id)),

      join: protectedProcedure
        .input(z.object({ challengeId: z.number() }))
        .mutation(({ input, ctx }) =>
          challengesService.joinChallenge(ctx.user.userId, input.challengeId)
        ),
    }),

    // --- 인증 피드 라우터 ---
    proof: router({
      create: protectedProcedure
        .input(
          z.object({ participationId: z.number(), content: z.string(), imageUrl: z.string().url() })
        )
        .mutation(({ input, ctx }) =>
          proofsService.createProof({
            userId: ctx.user.userId,
            participationId: input.participationId,
            content: input.content,
            imageUrl: input.imageUrl,
          })
        ),

      getAll: publicProcedure
        .input(
          z.object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(20),
          })
        )
        .query(({ input }) => {
          const { page, limit } = input;
          return proofsService.findAllProofs({ page, limit });
        }),

      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => proofsService.findProofById(input.id)),
    }),

    // --- 마이페이지 라우터 ---
    my: router({
      getProfile: protectedProcedure.query(({ ctx }) =>
        authService.getUserProfile(ctx.user.userId)
      ),

      getChallenges: protectedProcedure.query(({ ctx }) =>
        challengesService.findMyChallenges(ctx.user.userId)
      ),

      getProofs: protectedProcedure.query(({ ctx }) => proofsService.findMyProofs(ctx.user.userId)),
    }),

    // --- 관리자 페이지 전용 라우터 ---
    admin: router({
      challenge: router({
        create: adminProcedure
          .input(createChallengeSchema)
          .mutation(({ input }) => challengesService.createChallenge(input)),

        update: adminProcedure
          .input(updateChallengeSchema.extend({ id: z.number() }))
          .mutation(({ input }) => {
            const { id, ...updateData } = input;
            return challengesService.updateChallenge(id, updateData);
          }),

        delete: adminProcedure
          .input(z.object({ id: z.number() }))
          .mutation(({ input }) => challengesService.deleteChallenge(input.id)),
      }),
    }),
  });
}

// 최종 라우터의 타입을 export하여 클라이언트에서 사용
export type AppRouter = ReturnType<typeof appRouter>;
