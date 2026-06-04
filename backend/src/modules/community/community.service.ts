import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../core/prisma.service";

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts(filters: { search?: string; category?: string }) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.communityPost.findMany({
      where,
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createPost(
    userId: string,
    userName: string,
    data: { title: string; content: string; category: string; tags?: string[] }
  ) {
    return this.prisma.communityPost.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        authorId: userId,
        authorName: userName,
      },
      include: {
        comments: true,
      },
    });
  }

  async likePost(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    return this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        likes: { increment: 1 },
      },
      include: {
        comments: true,
      },
    });
  }

  async toggleSolved(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    return this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        isSolved: !post.isSolved,
      },
      include: {
        comments: true,
      },
    });
  }

  async addComment(
    postId: string,
    userId: string,
    userName: string,
    content: string
  ) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    return this.prisma.communityComment.create({
      data: {
        postId,
        content,
        authorId: userId,
        authorName: userName,
      },
    });
  }

  async deletePost(postId: string, userId: string, isAdmin: boolean) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    // Only Admin or the post's author can delete the post
    if (!isAdmin && post.authorId !== userId) {
      throw new ForbiddenException("Bạn không có quyền xóa bài viết này");
    }

    await this.prisma.communityPost.delete({
      where: { id: postId },
    });

    return { success: true };
  }
}
