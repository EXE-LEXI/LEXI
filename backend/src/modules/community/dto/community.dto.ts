import { IsString, IsNotEmpty, IsArray, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({ description: "Title of the community post" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Content body of the post" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: "Category of the post (e.g., civil, criminal, commercial)" })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: "Optional tags", type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CreateCommentDto {
  @ApiProperty({ description: "Content of the comment" })
  @IsString()
  @IsNotEmpty()
  content: string;
}
