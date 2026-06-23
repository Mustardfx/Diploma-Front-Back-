import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, HttpCode, HttpStatus,
  BadRequestException, Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Jwt } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';

@Controller('users')
  @UseGuards(Jwt)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    const user = await this.usersService.adminCreate(dto);
    return new UserDto(user);
  }

  @Get('/me')
  async getMe(@Request() req) {
    const user = await this.usersService.getUserById(req.user.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return new UserDto(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
  ): Promise<User> {
    return this.usersService.update(id, dto, requesterId, requesterRole);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<User> {
    return this.usersService.updateRole(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
