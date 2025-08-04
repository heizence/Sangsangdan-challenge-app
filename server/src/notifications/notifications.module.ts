import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { NotificationService } from "./notification.service";
import { TaskSchedulingService } from "./task-scheduling.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    HttpModule, // Expo Push API 호출을 위해
    UsersModule, // PushTokenService를 사용하기 위해
  ],
  providers: [NotificationService, TaskSchedulingService],
})
export class NotificationsModule {}
