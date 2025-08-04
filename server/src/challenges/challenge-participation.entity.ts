// server/src/challenges/challenge-participation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "../users/user.entity"; // User 엔티티가 있다고 가정
import { Challenge } from "./challenge.entity";

@Entity()
export class ChallengeParticipation {
  @PrimaryGeneratedColumn()
  id: number;

  [cite_start]; // ManyToOne 관계 설정 (참여자-챌린지) [cite: 129]
  // @ManyToOne(() => User, user => user.participations)
  // userId: number;

  // @ManyToOne(() => Challenge, challenge => challenge.participants)
  // challengeId: number;

  @Column()
  status: string;
  [cite_start]; // 참여 상태 (e.g., 'IN_PROGRESS', 'COMPLETED') [cite: 130]
}
