import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PushToken } from "./push-token.entity";

@Injectable()
export class PushTokenService {
  private readonly logger = new Logger(PushTokenService.name);

  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>
  ) {}

  async saveToken(token: string): Promise<PushToken> {
    // Expo Go에서 동일한 토큰이 생성될 수 있으므로 에러 대신 찾아서 반환
    const existingToken = await this.pushTokenRepository.findOneBy({ token });
    if (existingToken) {
      this.logger.log(`Token already exists: ${token}`);
      return existingToken;
    }
    this.logger.log(`Saving new token: ${token}`);
    const newToken = this.pushTokenRepository.create({ token });
    return this.pushTokenRepository.save(newToken);
  }

  async getAllTokens(): Promise<string[]> {
    const tokens = await this.pushTokenRepository.find();
    return tokens.map((t) => t.token);
  }
}
