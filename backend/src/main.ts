import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { securityHeadersMiddleware } from "./common/middleware/security-headers.middleware";
import { createValidationException } from "./common/validation/validation-exception.factory";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const port = configService.get<number>("PORT", 3000);

  app.set("trust proxy", 1);
  app.use(securityHeadersMiddleware);
  app.enableCors({
    origin: resolveCorsOrigins(
      configService.get<string>("CORS_ORIGINS", ""),
      nodeEnv
    ),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationException,
    })
  );

  if (nodeEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("LEXI API")
      .setDescription("The LEXI API documentation")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
  }

  await app.listen(port);
}

function resolveCorsOrigins(
  rawOrigins: string,
  nodeEnv: string
): boolean | string[] {
  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length > 0) {
    return origins;
  }

  return nodeEnv !== "production";
}

bootstrap();
