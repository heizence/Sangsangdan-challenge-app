import { Module } from "@nestjs/common";
import { ChallengesModule } from "../challenges/challenges.module";
import { ProofsModule } from "src/proofs/proofs.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { TrpcService } from "./trpc.service";

@Module({
  imports: [ChallengesModule, ProofsModule, UsersModule, AuthModule],
  providers: [TrpcService],
  exports: [TrpcService],
})
export class TrpcModule {}
