import { Injectable } from '@nestjs/common';
import { IRolesRepo } from '../../../../domain/repositories/roles-repo';
import { Role } from '../../../../domain/entities/role';
import { PrismaService } from '../prisma.service';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaRolesRepo implements IRolesRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string): Promise<Role | null> {
    const prismaRole = await this.prisma.role.findUnique({
      where: { key },
    });

    return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
  }

  async findByKeys(keys: string[]): Promise<Role[]> {
    const prismaRoles = await this.prisma.role.findMany({
      where: { key: { in: keys } },
    });

    return prismaRoles.map(RoleMapper.toDomain);
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.prisma.role.count({
      where: { key },
    });
    return count > 0;
  }

  async ensureKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.prisma.role.upsert({
        where: { key },
        update: {}, // No update needed if exists
        create: {
          key,
          nameEn: key,
          nameAr: key,
        },
      });
    }
  }

  async list(): Promise<Role[]> {
    const prismaRoles = await this.prisma.role.findMany({
      orderBy: { key: 'asc' },
    });

    return prismaRoles.map(RoleMapper.toDomain);
  }

  async create(role: Role): Promise<Role> {
    const data = RoleMapper.toPrismaCreate(role);
    const createdRole = await this.prisma.role.create({
      data,
    });

    return RoleMapper.toDomain(createdRole);
  }

  async update(role: Role): Promise<Role> {
    const data = RoleMapper.toPrismaUpdate(role);
    const updatedRole = await this.prisma.role.update({
      where: { id: role.id },
      data,
    });

    return RoleMapper.toDomain(updatedRole);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }
}
