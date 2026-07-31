import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsernameOrEmail(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    username: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role ?? Role.USER,
      },
    });
  }
}