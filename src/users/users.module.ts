import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HashService } from '../common/services/hash.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule {}
