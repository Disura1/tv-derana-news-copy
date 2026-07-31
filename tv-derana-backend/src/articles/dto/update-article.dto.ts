import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Category } from '@prisma/client';

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(Category)
  @IsOptional()
  category?: Category;
}