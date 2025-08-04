// server/src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { ChallengeModule } from "./challenges/challenges.module";
import { UsersModule } from "./users/users.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역적으로 .env 파일 사용
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "data/assignment.sqlite",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true, // 개발용
    }),
    ChallengeModule,
    UsersModule,
    NotificationsModule,
  ],
})
export class AppModule {}
