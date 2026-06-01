import { IsString, MaxLength } from "class-validator";

export class CreateLessonDiscussionReplyDto {
  @IsString()
  @MaxLength(2000)
  body: string;
}
