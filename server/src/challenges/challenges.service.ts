import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Challenge } from "./challenge.entity";
import { z } from "zod";

export const CreateChallengeSchema = z.object({
  title: z.string(),
  thumbnail: z.string(),
  frequency: z.string(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  authMethod: z.string(),
  authCountPerDay: z.string().optional(),
});

type CreateChallengeDto = z.infer<typeof CreateChallengeSchema>;

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private challengesRepository: Repository<Challenge>
  ) {}

  async findAll(): Promise<Challenge[]> {
    return this.challengesRepository.find();
  }

  async findOne(id: number): Promise<Challenge | null> {
    return this.challengesRepository.findOneBy({ id });
  }

  async create(challengeData: CreateChallengeDto): Promise<Challenge> {
    const newChallenge = this.challengesRepository.create(challengeData);
    return this.challengesRepository.save(newChallenge);
  }
}
