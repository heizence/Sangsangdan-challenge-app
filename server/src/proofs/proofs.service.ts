import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Proof } from "./entities/proof.entity";
import { CreateProofDto } from "./dto/create-proof.dto";

@Injectable()
export class ProofsService {
  constructor(
    @InjectRepository(Proof)
    private proofsRepository: Repository<Proof>
  ) {}

  /**
   * 새로운 인증 피드를 생성합니다.
   */
  async createProof(createProofDto: CreateProofDto): Promise<Proof> {
    const proof = this.proofsRepository.create({
      content: createProofDto.content,
      imageUrl: createProofDto.imageUrl,
      user: { id: createProofDto.userId },
      participation: { id: createProofDto.participationId },
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
