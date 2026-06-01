import { IsString, MaxLength } from "class-validator";

export class CreateLessonDiscussionDto {
  @IsString()
  @MaxLength(2000)
  question: string;
}
