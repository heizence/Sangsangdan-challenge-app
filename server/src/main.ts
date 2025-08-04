// server/src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/trpc.router";
import { ChallengeService } from "./challenges/challenges.service";
import { PushTokenService } from "./users/push-token.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 활성화 (프론트엔드와 통신을 위해)
  app.enableCors();

  // DI 컨테이너에서 각 서비스의 인스턴스를 가져옵니다.
  const challengeService = app.get(ChallengeService);
  const pushTokenService = app.get(PushTokenService);

  // 가져온 서비스 인스턴스들을 appRouter에 전달합니다.
  const router = appRouter(challengeService, pushTokenService);

  app.use(
    `/trpc`,
    trpcExpress.createExpressMiddleware({
      router: router,
    })
  );

  await app.listen(3000);
  console.log(`🚀 Server listening on http://localhost:3000`);
}
bootstrap();
