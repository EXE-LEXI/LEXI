import { Injectable } from "@nestjs/common";
import { UpdateNotificationPreferencesDto } from "../dto/request/update-notification-preferences.dto";
import { NotificationPreferencesResponseDto } from "../dto/response/notification-preferences-response.dto";
import { NotificationPreferencesMapper } from "../mappers/notification-preferences.mapper";
import {
  NotificationPreferenceUpdateData,
  NotificationPreferencesRepository,
} from "../repositories/notification-preferences.repository";

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly notificationPreferencesRepository: NotificationPreferencesRepository
  ) {}

  async getPreferences(
    userId: string
  ): Promise<NotificationPreferencesResponseDto> {
    const preference =
      (await this.notificationPreferencesRepository.findByUserId(userId)) ??
      (await this.notificationPreferencesRepository.createDefault(userId));

    return NotificationPreferencesMapper.toResponse(preference);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto
  ): Promise<NotificationPreferencesResponseDto> {
    const data = this.toUpdateData(dto);
    const preference =
      await this.notificationPreferencesRepository.upsertForUser(userId, data);

    return NotificationPreferencesMapper.toResponse(preference);
  }

  private toUpdateData(
    dto: UpdateNotificationPreferencesDto
  ): NotificationPreferenceUpdateData {
    const data: NotificationPreferenceUpdateData = {};

    if (dto.dailyReminderEnabled !== undefined) {
      data.dailyReminderEnabled = dto.dailyReminderEnabled;
    }
    if (dto.streakReminderEnabled !== undefined) {
      data.streakReminderEnabled = dto.streakReminderEnabled;
    }
    if (dto.reviewReminderEnabled !== undefined) {
      data.reviewReminderEnabled = dto.reviewReminderEnabled;
    }
    if (dto.reminderHour !== undefined) {
      data.reminderHour = dto.reminderHour;
    }
    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone;
    }
    if (dto.quietHoursStart !== undefined) {
      data.quietHoursStart = dto.quietHoursStart;
    }
    if (dto.quietHoursEnd !== undefined) {
      data.quietHoursEnd = dto.quietHoursEnd;
    }

    return data;
  }
}
