import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Proof } from "./entities/proof.entity";
import { ProofsService } from "./proofs.service";
import { ChallengeParticipation } from "src/challenges/entities/challenge-participation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Proof]),
    TypeOrmModule.forFeature([Proof, ChallengeParticipation]),
  ],
  providers: [ProofsService],
  exports: [ProofsService],
})
export class ProofsModule {}
