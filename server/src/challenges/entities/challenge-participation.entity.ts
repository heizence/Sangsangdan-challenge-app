import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Challenge } from "./challenge.entity";
import { Proof } from "../../proofs/entities/proof.entity";

@Entity()
export class ChallengeParticipation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.participations, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.participations, { onDelete: "CASCADE" })
  challenge: Challenge;

  @OneToMany(() => Proof, (proof) => proof.participation)
  proofs: Proof[];
}
