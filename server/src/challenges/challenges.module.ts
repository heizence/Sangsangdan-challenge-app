import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Challenge } from "./entities/challenge.entity";
import { ChallengeParticipation } from "./entities/challenge-participation.entity";
import { ChallengesService } from "./challenges.service";

@Module({
  imports: [TypeOrmModule.forFeature([Challenge, ChallengeParticipation])],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
