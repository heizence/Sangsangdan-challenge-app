import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChallengeService } from "./challenges.service";
import { Challenge } from "./challenge.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Challenge])],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
