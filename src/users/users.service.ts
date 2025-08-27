import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../common/services/hash.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ROLES } from '../common/constants/roles';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: any): Promise<UserResponseDto> {
    const { email, password, roleKeys = [], ...userData } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await this.hashService.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        passwordHash,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (roleKeys.length > 0) {
      await this.assignRoles(user.id, { roleKeys }, currentUser);
    }

    // Fetch user with updated roles
    return this.findOne(user.id);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
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
    });

    return users.map(user => this.transformToResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transformToResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const { email, roleKeys, ...userData } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(email && { email }),
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.transformToResponseDto(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async assignRoles(userId: string, assignRolesDto: AssignRolesDto, currentUser?: any): Promise<UserResponseDto> {
    // Ensure only SuperAdmin can assign roles (except during bootstrap)
    if (currentUser && !currentUser.roles?.includes('SuperAdmin')) {
      throw new ForbiddenException('Only SuperAdmin can assign roles');
    }

    const { roleKeys } = assignRolesDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify all roles exist and get their IDs
    const roles = await this.prisma.role.findMany({
      where: {
        key: {
          in: roleKeys,
        },
      },
    });

    if (roles.length !== roleKeys.length) {
      throw new NotFoundException('One or more roles not found');
    }

    const roleIds = roles.map(role => role.id);

    // Remove existing roles
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });

    // Add new roles
    const userRoles = roleIds.map(roleId => ({
      userId,
      roleId,
    }));

    await this.prisma.userRole.createMany({
      data: userRoles,
    });

    return this.findOne(userId);
  }

  private transformToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneNumberCountryCode: user.phoneNumberCountryCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map(userRole => ({
        id: userRole.role.id,
        key: userRole.role.key,
        nameEn: userRole.role.nameEn,
        nameAr: userRole.role.nameAr,
      })),
    };
  }
}
