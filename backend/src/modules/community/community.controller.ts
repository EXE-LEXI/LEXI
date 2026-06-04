import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../auth/dto/response/auth-user.dto";
import { CommunityService } from "./community.service";
import { CreatePostDto, CreateCommentDto } from "./dto/community.dto";
import { UserRole } from "@prisma/client";

@ApiTags("Community")
@Controller("community")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get("posts")
  @ApiOperation({ summary: "Get community posts with search and category filters" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "category", required: false, type: String })
  async getPosts(
    @Query("search") search?: string,
    @Query("category") category?: string
  ) {
    return this.communityService.getPosts({ search, category });
  }

  @Post("posts")
  @ApiOperation({ summary: "Create a new community post" })
  async createPost(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: CreatePostDto
  ) {
    const authorName = user.profile?.fullName || user.email;
    return this.communityService.createPost(user.id, authorName, dto);
  }

  @Post("posts/:id/like")
  @ApiOperation({ summary: "Like a community post" })
  @ApiParam({ name: "id", type: String })
  async likePost(@Param("id") id: string) {
    return this.communityService.likePost(id);
  }

  @Patch("posts/:id/solved")
  @ApiOperation({ summary: "Toggle solved status of a community post" })
  @ApiParam({ name: "id", type: String })
  async toggleSolved(@Param("id") id: string) {
    return this.communityService.toggleSolved(id);
  }

  @Post("posts/:id/comments")
  @ApiOperation({ summary: "Add a comment to a community post" })
  @ApiParam({ name: "id", type: String })
  async addComment(
    @CurrentUser() user: AuthUserDto,
    @Param("id") id: string,
    @Body() dto: CreateCommentDto
  ) {
    const authorName = user.profile?.fullName || user.email;
    return this.communityService.addComment(id, user.id, authorName, dto.content);
  }

  @Delete("posts/:id")
  @ApiOperation({ summary: "Delete a community post (Admin or Author only)" })
  @ApiParam({ name: "id", type: String })
  async deletePost(
    @CurrentUser() user: AuthUserDto,
    @Param("id") id: string
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.communityService.deletePost(id, user.id, isAdmin);
  }
}
