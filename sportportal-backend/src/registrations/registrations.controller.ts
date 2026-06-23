import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto, UpdateRegistrationStatusDto } from './dto/registration.dto';
import { Jwt } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('registrations')
  @UseGuards(Jwt)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  findAll() {
    return this.registrationsService.findAll();
  }

  @Get('my')
  findMine(@CurrentUser('id') userId: string) {
    return this.registrationsService.findByUser(userId);
  }

  @Get('competition/:competitionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.JUDGE)
  findByCompetition(@Param('competitionId') competitionId: string) {
    return this.registrationsService.findByCompetition(competitionId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ATHLETE)
  register(
    @Body() dto: CreateRegistrationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.registrationsService.register(dto, userId);
  }

  @Patch(':id/withdraw')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ATHLETE)
  withdraw(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.registrationsService.withdraw(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    return this.registrationsService.updateStatus(id, dto);
  }
}
