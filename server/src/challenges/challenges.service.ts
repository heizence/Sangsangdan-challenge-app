import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Challenge } from "./entities/challenge.entity";
import { ChallengeParticipation } from "./entities/challenge-participation.entity";
import { UpdateChallengeDto } from "./dto/update-challenge.dto";

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private challengesRepository: Repository<Challenge>,
    @InjectRepository(ChallengeParticipation)
    private participationsRepository: Repository<ChallengeParticipation>
  ) {}

  // --- 챌린지 (관리자용) ---
  async createChallenge(challengeData: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.challengesRepository.create(challengeData);
    return this.challengesRepository.save(challenge);
  }

  async updateChallenge(id: number, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
    const challenge = await this.findChallengeById(id); // 기존 조회 메서드 재사용
    Object.assign(challenge, updateChallengeDto);
    return this.challengesRepository.save(challenge);
  }

  async deleteChallenge(id: number): Promise<void> {
    const result = await this.challengesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
  }

  // --- 챌린지 조회 (사용자용) ---
  async findAllChallenges(options: {
    page: number;
    limit: number;
    filter?: string;
  }): Promise<Challenge[]> {
    const { page, limit, filter } = options;
    const query = this.challengesRepository.createQueryBuilder("challenge");

    // 필터링 로직 (예시)
    const now = new Date();
    if (filter === "recruiting") {
      query.where("challenge.startDate <= :now AND challenge.endDate >= :now", { now });
    } else if (filter === "upcoming") {
      query.where("challenge.startDate > :now", { now });
    } else if (filter === "ended") {
      query.where("challenge.endDate < :now", { now });
    }

    // 페이징 및 정렬
    query
      .orderBy("challenge.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    return query.getMany();
  }

  async findChallengeById(id: number): Promise<Challenge> {
    const challenge = await this.challengesRepository.findOneBy({ id });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
    return challenge;
  }

  // --- 참여 ---
  async joinChallenge(userId: number, challengeId: number): Promise<ChallengeParticipation> {
    // TODO: 중복 참여 방지 로직 추가
    const participation = this.participationsRepository.create({
      user: { id: userId },
      challenge: { id: challengeId },
      status: "IN_PROGRESS",
    });
    return this.participationsRepository.save(participation);
  }

  // --- 마이페이지 ---
  async findMyChallenges(userId: number): Promise<ChallengeParticipation[]> {
    return this.participationsRepository.find({
      where: { user: { id: userId } },
      relations: ["challenge"], // 참여 정보와 함께 챌린지 정보도 가져오기
    });
  }
}
