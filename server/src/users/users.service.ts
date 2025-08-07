import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService
  ) {}

  /**
   * 서버 시작 시 초기 관리자 계정을 생성합니다.
   */
  async onModuleInit() {
    const adminEmail = this.configService.get<string>("ADMIN_EMAIL");
    const adminExists = await this.findUserByEmail(adminEmail);

    // 관리자 계정 생성
    if (!adminExists) {
      console.log("초기 관리자 계정을 생성합니다...");
      const adminPassword = this.configService.get<string>("ADMIN_PASSWORD");

      const adminData = {
        email: adminEmail,
        password: adminPassword,
        nickname: "관리자",
        role: "admin" as "admin",
      };
      await this.createUser(adminData);
      console.log(`관리자 계정 생성 완료 (Email: ${adminEmail})`);
    }

    // 👇 테스트용 일반 사용자 계정 5개 생성
    const testUsers = [
      { email: "user1@example.com", nickname: "열정맨" },
      { email: "user2@example.com", nickname: "걷기왕" },
      { email: "user3@example.com", nickname: "독서광" },
      { email: "user4@example.com", nickname: "미라클모닝" },
      { email: "user5@example.com", nickname: "갓생러" },
    ];

    for (const userData of testUsers) {
      const userExists = await this.findUserByEmail(userData.email);
      if (!userExists) {
        console.log(`${userData.nickname} 테스트 계정을 생성합니다...`);
        await this.createUser({
          ...userData,
          password: "password123", // 모든 테스트 계정의 비밀번호는 동일
          role: "user" as "user",
        });
        console.log(`${userData.nickname} 계정 생성 완료 (Email: ${userData.email})`);
      }
    }
  }

  /**
   * 새로운 사용자를 생성하고 비밀번호를 해싱하여 저장합니다.
   * @param createUserDto - 사용자 생성을 위한 데이터
   * @returns 생성된 사용자 정보
   */
  async createUser(createUserDto: CreateUserDto & { role?: "user" | "admin" }): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  /**
   * 이메일을 기준으로 사용자를 찾습니다.
   * @param email - 찾고자 하는 사용자의 이메일
   * @returns 사용자 정보 또는 null
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  /**
   * ID를 기준으로 사용자를 찾습니다.
   * @param id - 찾고자 하는 사용자의 ID
   * @returns 사용자 정보 또는 null
   */
  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
}
