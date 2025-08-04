import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { ChallengeService, CreateChallengeSchema } from "../challenges/challenges.service";
import { PushTokenService } from "../users/push-token.service";

export function appRouter(challengeService: ChallengeService, pushTokenService: PushTokenService) {
  const t = initTRPC.create();
  const publicProcedure = t.procedure;
  const router = t.router;

  return router({
    challenge: router({
      getChallenges: publicProcedure.query(async () => {
        return await challengeService.findAll();
      }),
      getChallengeById: publicProcedure.input(z.number()).query(async ({ input }) => {
        return await challengeService.findOne(input);
      }),
      createChallenge: publicProcedure.input(CreateChallengeSchema).mutation(async ({ input }) => {
        return await challengeService.create(input);
      }),
    }),
    user: router({
      registerPushToken: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        await pushTokenService.saveToken(input);
        return { success: true };
      }),
    }),
  });
}
