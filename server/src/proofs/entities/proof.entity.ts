import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ChallengeParticipation } from "../../challenges/entities/challenge-participation.entity";

@Entity()
export class Proof {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  content: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.proofs, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => ChallengeParticipation, (participation) => participation.proofs, {
    onDelete: "CASCADE",
  })
  participation: ChallengeParticipation;
}
