import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { ChallengesModule } from "./challenges/challenges.module";
import { AuthModule } from "./auth/auth.module";
import { TrpcModule } from "./trpc/trpc.module";

import { User } from "./users/entities/user.entity";
import { Challenge } from "./challenges/entities/challenge.entity";
import { ChallengeParticipation } from "./challenges/entities/challenge-participation.entity";
import { Proof } from "./proofs/entities/proof.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "data/assignment.sqlite",
      entities: [User, Challenge, ChallengeParticipation, Proof],
      synchronize: true, // 개발용. DB와 엔티티를 자동으로 동기화
    }),
    UsersModule,
    ChallengesModule,
    AuthModule,
    TrpcModule,
  ],
})
export class AppModule {}
