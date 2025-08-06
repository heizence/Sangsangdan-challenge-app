import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ChallengeParticipation } from "../../challenges/entities/challenge-participation.entity";
import { Proof } from "../../proofs/entities/proof.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  // 👇 사용자 역할을 구분하는 컬럼 (기본값: 'user')
  @Column({ type: "varchar", default: "user" })
  role: "user" | "admin";

  @OneToMany(() => ChallengeParticipation, (participation) => participation.user)
  participations: ChallengeParticipation[];

  @OneToMany(() => Proof, (proof) => proof.user)
  proofs: Proof[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
