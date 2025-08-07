import { initTRPC } from "@trpc/server";
import { z } from "zod";

const userSchema = z.object({ id: z.number(), email: z.string().email(), nickname: z.string() });
const challengeSchema = z.object({
  id: z.number(),
  title: z.string(),
  thumbnail: z.string().url(),
  frequency: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  authCountPerDay: z.string(),
  authDescription: z.string(),
});
const proofSchema = z.object({
  id: z.number(),
  content: z.string(),
  imageUrl: z.string().url(),
  createdAt: z.date(),
});
const participationSchema = z.object({
  id: z.number(),
  status: z.string(),
  challenge: challengeSchema,
});

const t = initTRPC.create();

const appRouter = t.router({
  auth: t.router({
    signUp: t.procedure
      .input(
        z.object({ email: z.string().email(), password: z.string().min(8), nickname: z.string() })
      )
      .output(userSchema)
      .mutation(() => null),
    login: t.procedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .output(z.object({ access_token: z.string() }))
      .mutation(() => null),
    logout: t.procedure.mutation(() => null),
  }),

  challenge: t.router({
    getAll: t.procedure
      .input(
        z.object({
          page: z.number().optional(),
          limit: z.number().optional(),
          filter: z.string().optional(),
        })
      )
      .output(z.array(challengeSchema))
      .query(() => null),
    getById: t.procedure
      .input(z.object({ id: z.number() }))
      .output(challengeSchema)
      .query(() => null),
    join: t.procedure.input(z.object({ challengeId: z.number() })).mutation(() => null),
  }),

  proof: t.router({
    getAll: t.procedure
      .input(z.object({ page: z.number().optional(), limit: z.number().optional() }))
      .output(z.array(proofSchema))
      .query(() => null),
    getById: t.procedure
      .input(z.object({ id: z.number() }))
      .output(proofSchema)
      .query(() => null),
    create: t.procedure
      .input(
        z.object({ participationId: z.number(), content: z.string(), imageUrl: z.string().url() })
      )
      .output(proofSchema)
      .mutation(() => null),
  }),

  my: t.router({
    getProfile: t.procedure.output(userSchema).query(() => null),
    getChallenges: t.procedure.output(z.array(participationSchema)).query(() => null),
    getProofs: t.procedure.output(z.array(proofSchema)).query(() => null),
  }),
  admin: t.router({
    challenge: t.router({
      update: t.procedure
        .input(challengeSchema.partial().extend({ id: z.number() }))
        .output(challengeSchema)
        .mutation(() => null),
      delete: t.procedure
        .input(z.object({ id: z.number() }))
        .output(z.object({ success: z.boolean() }))
        .mutation(() => null),
    }),
  }),
});

export type AppRouter = typeof appRouter;
