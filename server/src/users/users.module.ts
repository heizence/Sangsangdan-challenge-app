import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PushToken } from "./push-token.entity";
import { PushTokenService } from "./push-token.service";

@Module({
  imports: [TypeOrmModule.forFeature([PushToken])],
  providers: [PushTokenService],
  exports: [PushTokenService],
})
export class UsersModule {}
