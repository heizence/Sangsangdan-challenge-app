import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationService } from "./notification.service";
import { PushTokenService } from "../users/push-token.service";

@Injectable()
export class TaskSchedulingService {
  private readonly logger = new Logger(TaskSchedulingService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly pushTokenService: PushTokenService
  ) {}

  // 테스트를 위해 매 분마다 실행
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug("Running a scheduled task to send notifications...");

    const tokens = await this.pushTokenService.getAllTokens();
    if (tokens.length === 0) {
      this.logger.debug("No tokens found. Skipping notifications.");
      return;
    }

    this.logger.log(`Found ${tokens.length} tokens. Sending notifications...`);

    for (const token of tokens) {
      await this.notificationService.sendPushNotification(token, "오늘의 챌린지를 잊지 마세요! 💪");
    }
  }
}
