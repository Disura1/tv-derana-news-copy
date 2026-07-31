import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Category } from '@prisma/client';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(Category)
  category: Category;
}