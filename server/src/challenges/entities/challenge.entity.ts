import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ChallengeParticipation } from "./challenge-participation.entity";

@Entity()
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  thumbnail: string;

  @Column()
  frequency: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column()
  authCountPerDay: string;

  @Column("text")
  authDescription: string;

  @OneToMany(() => ChallengeParticipation, (participation) => participation.challenge)
  participations: ChallengeParticipation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
