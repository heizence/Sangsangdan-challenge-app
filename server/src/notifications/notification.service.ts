import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendPushNotification(token: string, message: string): Promise<void> {
    const expoPushUrl = "https://exp.host/--/api/v2/push/send";
    const payload = { to: token, sound: "default", body: message };

    try {
      await firstValueFrom(this.httpService.post(expoPushUrl, payload));
      this.logger.log(`Notification sent to ${token}`);
    } catch (error) {
      this.logger.error(`Error sending push notification to ${token}:`, error.response?.data);
    }
  }
}
