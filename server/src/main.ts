import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { join } from "path";
import { JwtService } from "@nestjs/jwt";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { TrpcService } from "./trpc/trpc.service";
import { createInnerTRPCContext } from "./trpc/trpc.context";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // tRPC 설정
  const trpcRouter = app.get(TrpcService).createRouter();
  const jwtService = app.get(JwtService);

  app.use(
    `/trpc`,
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      // 모든 요청에 대해 컨텍스트를 생성하는 함수
      createContext: (opts) => {
        // 요청으로부터 기본 컨텍스트 생성
        const innerContext = createInnerTRPCContext(opts);
        // DI로 주입된 서비스를 추가하여 최종 컨텍스트 완성
        return {
          ...innerContext,
          jwtService,
        };
      },
    })
  );

  const port = process.env.PORT;
  await app.listen(port);
  console.log(`🚀 Server listening on ${process.env.ADDRESS}:${port}`);
}
bootstrap();
