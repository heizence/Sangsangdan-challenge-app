// server/src/challenges/challenge-proof.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class ChallengeProof {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // participationId: number; // 어떤 참여에 대한 인증인지 ID로 연결

  @Column({ type: "text", nullable: true })
  content: string;
  [cite_start]; // 인증 내용(텍스트) [cite: 132]

  @Column({ nullable: true })
  imageUrl: string;
  [cite_start]; // 인증 증빙 자료 (이미지 URL) [cite: 133]

  @CreateDateColumn()
  createdAt: Date;
  [cite_start]; // 인증 시간 [cite: 132]
}
