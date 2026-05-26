import { Injectable, Logger } from "@nestjs/common";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

export type FirebaseSendResult = {
  success: boolean;
  invalidToken: boolean;
};

type ServiceAccountConfig = {
  credential: admin.ServiceAccount;
  source: string;
};

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const serviceAccount = this.loadServiceAccount();
      if (serviceAccount) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount.credential),
        });
        this.logger.log(
          `Firebase Admin initialized successfully from ${serviceAccount.source}.`
        );
      } else {
        this.logger.warn(
          "Firebase Admin credentials are not configured. Push notifications are disabled."
        );
      }
    } catch (error) {
      this.logger.error("Error initializing Firebase Admin:", error);
    }
  }

  private loadServiceAccount(): ServiceAccountConfig | null {
    const jsonConfig = this.loadServiceAccountFromJsonEnv();
    if (jsonConfig) {
      return jsonConfig;
    }

    const envConfig = this.loadServiceAccountFromFieldEnvs();
    if (envConfig) {
      return envConfig;
    }

    const pathConfig = this.loadServiceAccountFromPathEnv();
    if (pathConfig) {
      return pathConfig;
    }

    return this.loadServiceAccountFromLocalFile();
  }

  private loadServiceAccountFromJsonEnv(): ServiceAccountConfig | null {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!rawJson) {
      return null;
    }

    return {
      credential: JSON.parse(rawJson) as admin.ServiceAccount,
      source: "FIREBASE_SERVICE_ACCOUNT_JSON",
    };
  }

  private loadServiceAccountFromFieldEnvs(): ServiceAccountConfig | null {
    const projectId = process.env.FCM_PROJECT_ID;
    const clientEmail = process.env.FCM_CLIENT_EMAIL;
    const privateKey = process.env.FCM_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    return {
      credential: {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      },
      source: "FCM_PROJECT_ID/FCM_CLIENT_EMAIL/FCM_PRIVATE_KEY",
    };
  }

  private loadServiceAccountFromPathEnv(): ServiceAccountConfig | null {
    const credentialPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!credentialPath) {
      return null;
    }

    const serviceAccountPath = path.resolve(process.cwd(), credentialPath);
    if (!fs.existsSync(serviceAccountPath)) {
      this.logger.warn(
        `FIREBASE_SERVICE_ACCOUNT_PATH does not exist: ${serviceAccountPath}`
      );
      return null;
    }

    return {
      credential: this.readServiceAccountFile(serviceAccountPath),
      source: "FIREBASE_SERVICE_ACCOUNT_PATH",
    };
  }

  private loadServiceAccountFromLocalFile(): ServiceAccountConfig | null {
    const serviceAccountPath = path.resolve(
      process.cwd(),
      "firebase-service-account.json"
    );
    if (!fs.existsSync(serviceAccountPath)) {
      return null;
    }

    return {
      credential: this.readServiceAccountFile(serviceAccountPath),
      source: "firebase-service-account.json",
    };
  }

  private readServiceAccountFile(serviceAccountPath: string) {
    return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  }

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<FirebaseSendResult> {
    if (!this.firebaseApp) {
      this.logger.warn(
        "Cannot send notification, Firebase is not initialized."
      );
      return { success: false, invalidToken: false };
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
      };
      const response = await this.firebaseApp.messaging().send(message);
      this.logger.log(`Successfully sent message: ${response}`);
      return { success: true, invalidToken: false };
    } catch (error) {
      this.logger.error("Error sending message:", error);
      return {
        success: false,
        invalidToken: this.isInvalidTokenError(error),
      };
    }
  }

  private isInvalidTokenError(error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";

    return (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    );
  }
}
