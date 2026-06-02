import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ChatbotService } from "./chatbot.service";
import { ChatMessageDto } from "./dto/chat.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../auth/dto/response/auth-user.dto";

@ApiTags("Chatbot")
@Controller("chatbot")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get("history")
  @ApiOperation({ summary: "Get chat history for current user" })
  async getHistory(@CurrentUser() user: AuthUserDto) {
    return this.chatbotService.getHistory(user.id);
  }

  @Post("chat")
  @ApiOperation({ summary: "Send a message to the AI chatbot" })
  async chat(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: ChatMessageDto
  ) {
    return this.chatbotService.sendMessage(user.id, dto.message);
  }
}
