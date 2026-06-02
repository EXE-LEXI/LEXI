import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { PrismaService } from "../../core/prisma.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  
  private readonly geminiEndpoint: string;
  private readonly geminiApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.geminiEndpoint = this.configService.get<string>("AI_DRAFT_ENDPOINT", "");
    this.geminiApiKey = this.configService.get<string>("AI_DRAFT_API_KEY", "");
  }

  async getHistory(userId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!session) {
      return [];
    }
    
    return session.messages;
  }

  async sendMessage(userId: string, message: string) {
    if (!this.geminiEndpoint || !this.geminiApiKey) {
      throw new InternalServerErrorException("Gemini configuration is missing");
    }

    // Ensure session exists
    let session = await this.prisma.chatSession.findUnique({
      where: { userId },
      include: { messages: { orderBy: { createdAt: "asc" } } }
    });

    if (!session) {
      session = await this.prisma.chatSession.create({
        data: { userId },
        include: { messages: true }
      });
    }

    // Save user message
    await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message
      }
    });

    // Prepare history for Gemini (use last 20 messages to avoid token overflow)
    const recentMessages = session.messages.slice(-20);
    const contents = recentMessages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const systemInstruction = {
      role: "user",
      parts: [{ 
        text: `Bạn là trợ lý pháp lý chuyên sâu của nền tảng LEXI – ứng dụng học pháp luật Việt Nam. Hãy tuân thủ các nguyên tắc sau:

1. CHỈ TRẢ LỜI các câu hỏi liên quan đến pháp luật (luật dân sự, hình sự, hành chính, lao động, đất đai, doanh nghiệp, hôn nhân gia đình, v.v.).
2. Nếu người dùng hỏi chủ đề KHÔNG liên quan đến pháp luật, từ chối lịch sự và hướng dẫn họ quay lại chủ đề pháp luật.
3. Trả lời chi tiết, chính xác, có trích dẫn điều luật cụ thể khi có thể.
4. Sử dụng ngôn ngữ dễ hiểu, thân thiện, phù hợp với người học.
5. Khi phân tích vấn đề pháp lý, hãy đi sâu vào bản chất, nêu rõ cơ sở pháp lý, và đưa ra hướng giải quyết nếu phù hợp.
6. Luôn trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác.`
      }]
    };

    try {
      const response = await fetch(`${this.geminiEndpoint}?key=${this.geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API Error: ${errorText}`);
        throw new InternalServerErrorException("Failed to generate response from AI");
      }

      const data = await response.json();
      
      const replyContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.";

      // Save AI message
      const aiMessage = await this.prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "model",
          content: replyContent
        }
      });

      return {
        reply: replyContent,
        messageId: aiMessage.id
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error("Chatbot communication error:", error);
      throw new InternalServerErrorException("Failed to communicate with AI provider");
    }
  }
}
