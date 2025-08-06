import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  /**
   * 이메일과 비밀번호로 사용자를 검증합니다. (로그인 시 사용)
   * @param email 사용자 이메일
   * @param pass 사용자 비밀번호
   * @returns 비밀번호를 제외한 사용자 정보 또는 null
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * 검증된 사용자를 기반으로 JWT 토큰을 생성합니다.
   * @param user 사용자 정보 객체
   * @returns access_token
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * JWT 토큰에 담긴 ID를 사용하여 사용자 프로필 정보를 조회합니다.
   * 이 메서드는 보통 JwtAuthGuard로 보호된 라우트에서 호출됩니다.
   * @param userId - 사용자 ID
   * @returns 비밀번호를 제외한 사용자 정보
   */
  async getUserProfile(userId: number) {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    // 보안을 위해 비밀번호 필드를 제외하고 반환합니다.
    const { password, ...result } = user;
    return result;
  }
}
