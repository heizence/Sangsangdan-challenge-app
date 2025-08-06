import { Injectable } from "@nestjs/common";
import { ChallengesService } from "../challenges/challenges.service";
import { UsersService } from "../users/users.service";
import { AuthService } from "../auth/auth.service";
import { appRouter } from "./trpc.router";
import { ProofsService } from "src/proofs/proofs.service";

@Injectable()
export class TrpcService {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly proofsService: ProofsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  // 주입받은 서비스들을 사용하여 tRPC 라우터를 생성하는 메서드
  createRouter() {
    return appRouter(
      this.challengesService,
      this.proofsService,
      this.usersService,
      this.authService
    );
  }
}
