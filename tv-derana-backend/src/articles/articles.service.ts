import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateArticleDto) {
    return this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        authorId,
      },
    });
  }

  async findAll(sortBy?: string, category?: Category) {
    let orderBy: Prisma.ArticleOrderByWithRelationInput = { publishedAt: 'desc' };

    if (sortBy === 'popularity') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'category') {
      orderBy = { category: 'asc' };
    }

    return this.prisma.article.findMany({
      where: category ? { category } : undefined,
      orderBy,
      include: {
        author: { select: { id: true, username: true } },
      },
    });
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return article;
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.ensureExists(id);
    return this.prisma.article.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.article.delete({ where: { id } });
  }

  async likeArticle(id: string) {
    await this.ensureExists(id);
    return this.prisma.article.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
  }

  private async ensureExists(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
  }
}
