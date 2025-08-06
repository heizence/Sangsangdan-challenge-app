import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  /**
   * 새로운 사용자를 생성하고 비밀번호를 해싱하여 저장합니다.
   * @param createUserDto - 사용자 생성을 위한 데이터
   * @returns 생성된 사용자 정보
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
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
