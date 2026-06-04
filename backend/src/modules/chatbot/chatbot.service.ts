import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../core/prisma.service";

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly geminiEndpoint: string;
  private readonly geminiApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.geminiEndpoint = this.configService.get<string>(
      "AI_DRAFT_ENDPOINT",
      ""
    );
    this.geminiApiKey = this.configService.get<string>("AI_DRAFT_API_KEY", "");
  }

  async getHistory(userId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return session?.messages ?? [];
  }

  async sendMessage(userId: string, message: string) {
    if (!this.geminiEndpoint || !this.geminiApiKey) {
      throw new InternalServerErrorException("Gemini configuration is missing");
    }

    let session = await this.prisma.chatSession.findUnique({
      where: { userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      session = await this.prisma.chatSession.create({
        data: { userId },
        include: { messages: true },
      });
    }

    await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    const recentMessages = session.messages.slice(-8);
    const contents = recentMessages.map((entry) => ({
      role: entry.role === "user" ? "user" : "model",
      parts: [{ text: entry.content }],
    }));

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const systemInstruction = {
      parts: [
        {
          text: `Bạn là trợ lý pháp lý của LEXI, nền tảng học pháp luật Việt Nam.

Quy tắc trả lời:
1. Chỉ trả lời nội dung liên quan đến pháp luật hoặc việc học pháp luật.
2. Nếu câu hỏi không liên quan, từ chối ngắn gọn và mời người dùng hỏi chủ đề pháp lý.
3. Trả lời cực kỳ ngắn gọn, trực diện, không dài dòng. Luôn trình bày dưới dạng danh sách gạch đầu dòng (bullet points), tối đa 3-4 ý chính.
4. Chỉ nêu điều luật cụ thể khi chắc chắn; nếu không chắc, đề xuất người dùng kiểm tra văn bản hiện hành.
5. Tuyệt đối không viết thành các đoạn văn dài dòng lê thê.
6. Luôn trả lời bằng tiếng Việt.`,
        },
      ],
    };

    try {
      const response = await fetch(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            systemInstruction,
            generationConfig: {
              temperature: 0.55,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API Error: ${errorText}`);
        throw new InternalServerErrorException(
          "Failed to generate response from AI"
        );
      }

      const data = await response.json();
      const replyContent =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Xin lỗi, tôi chưa thể trả lời lúc này. Vui lòng thử lại sau.";

      const aiMessage = await this.prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "model",
          content: replyContent,
        },
      });

      return {
        reply: replyContent,
        messageId: aiMessage.id,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error("Chatbot communication error:", error);
      throw new InternalServerErrorException(
        "Failed to communicate with AI provider"
      );
    }
  }
}
