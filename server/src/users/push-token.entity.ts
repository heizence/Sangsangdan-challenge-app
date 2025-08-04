import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PushToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;
}
