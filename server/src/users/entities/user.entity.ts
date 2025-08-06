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

  @OneToMany(() => ChallengeParticipation, (participation) => participation.user)
  participations: ChallengeParticipation[];

  @OneToMany(() => Proof, (proof) => proof.user)
  proofs: Proof[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
