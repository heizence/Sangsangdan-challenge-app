import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Proof } from "./entities/proof.entity";
import { CreateProofDto } from "./dto/create-proof.dto";
import { ChallengeParticipation } from "src/challenges/entities/challenge-participation.entity";

@Injectable()
export class ProofsService {
  constructor(
    @InjectRepository(Proof)
    private proofsRepository: Repository<Proof>,
    @InjectRepository(ChallengeParticipation)
    private participationsRepository: Repository<ChallengeParticipation>
  ) {}

  /**
   * 새로운 인증 피드를 생성합니다.
   */
  async createProof(createProofDto: CreateProofDto): Promise<Proof> {
    const { userId, participationId, content, imageUrl } = createProofDto;

    // 1. 참여 정보와 챌린지 규칙을 함께 조회합니다.
    const participation = await this.participationsRepository.findOne({
      where: { id: participationId, user: { id: userId } },
      relations: ["challenge"],
    });

    if (!participation) {
      throw new NotFoundException("해당 챌린지 참여 정보를 찾을 수 없습니다.");
    }

    // 2. '하루 1회' 제한이 걸려있는지 확인합니다.
    if (participation.challenge.authCountPerDay === "하루 1회") {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      const count = await this.proofsRepository.count({
        where: {
          participation: { id: participationId },
          createdAt: Between(startOfDay, endOfDay),
        },
      });

      if (count > 0) {
        throw new ConflictException("오늘은 이미 인증을 완료했습니다.");
      }
    }

    // 3. 모든 검증 통과 시, 인증 피드를 생성합니다.
    const proof = this.proofsRepository.create({
      content,
      imageUrl,
      user: { id: userId },
      participation: { id: participationId },
    });
    return this.proofsRepository.save(proof);
  }

  /**
   * 모든 인증 피드를 최신순으로 페이징하여 조회합니다.
   */
  async findAllProofs(options: { page: number; limit: number }): Promise<Proof[]> {
    return this.proofsRepository.find({
      order: { createdAt: "DESC" },
      relations: ["user", "participation", "participation.challenge"], // 사용자, 챌린지 정보 포함
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });
  }

  /**
   * 특정 인증 피드를 상세 조회합니다.
   */
  async findProofById(id: number): Promise<Proof> {
    const proof = await this.proofsRepository.findOne({
      where: { id },
      relations: ["user", "participation", "participation.challenge"],
    });
    if (!proof) {
      throw new NotFoundException(`Proof with ID ${id} not found`);
    }
    return proof;
  }

  /**
   * 특정 사용자의 모든 인증 내역을 최신순으로 조회합니다.
   * @param userId - 사용자 ID
   * @returns 해당 사용자의 모든 인증 피드 목록
   */
  async findMyProofs(userId: number): Promise<Proof[]> {
    return this.proofsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
      relations: ["participation", "participation.challenge"], // 어떤 챌린지에 대한 인증인지 함께 조회
    });
  }
}
