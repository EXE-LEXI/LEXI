import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChatMessageDto {
  @ApiProperty({ description: "The message from the user to the chatbot" })
  @IsString()
  @IsNotEmpty()
  message: string;
}
