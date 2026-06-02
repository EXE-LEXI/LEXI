import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./core/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AdminContentModule } from "./modules/admin-content/admin-content.module";
import { AdminUsersModule } from "./modules/admin-users/admin-users.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { LearningModule } from "./modules/learning/learning.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ResourcesModule } from "./modules/resources/resources.module";
import { UsersModule } from "./modules/users/users.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { RewardsModule } from "./modules/rewards/rewards.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AutomatedPipelineModule } from "./modules/automated-pipeline/automated-pipeline.module";
import { ChatbotModule } from "./modules/chatbot/chatbot.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    AdminContentModule,
    AdminUsersModule,
    UsersModule,
    LearningModule,
    GamificationModule,
    LeaderboardModule,
    NotificationModule,
    ResourcesModule,
    FeedbackModule,
    RewardsModule,
    FirebaseModule,
    ScheduleModule.forRoot(),
    AutomatedPipelineModule,
    ChatbotModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
