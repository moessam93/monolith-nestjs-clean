import { Injectable } from '@nestjs/common';
import { IUsersRepo } from '../../../../domain/repositories/users-repo';
import { User } from '../../../../domain/entities/user';
import { PrismaService } from '../prisma.service';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUsersRepo implements IUsersRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  async list(options: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 20, search } = options;
    
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [prismaUsers, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: prismaUsers.map(UserMapper.toDomain),
      total,
    };
  }

  async create(user: User): Promise<User> {
    const data = UserMapper.toPrismaCreate(user);
    const createdUser = await this.prisma.user.create({
      data,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return UserMapper.toDomain(createdUser);
  }

  async update(user: User): Promise<User> {
    const data = UserMapper.toPrismaUpdate(user);
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return UserMapper.toDomain(updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async setRoles(userId: string, roleKeys: string[]): Promise<void> {
    // Get roles by keys
    const roles = await this.prisma.role.findMany({
      where: { key: { in: roleKeys } },
    });

    // Remove existing roles
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });

    // Add new roles
    if (roles.length > 0) {
      await this.prisma.userRole.createMany({
        data: roles.map(role => ({
          userId,
          roleId: role.id,
        })),
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
