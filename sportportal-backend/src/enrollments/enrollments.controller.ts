import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { Jwt } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('enrollments')
  @UseGuards(Jwt)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('my')
  findMine(@CurrentUser('id') userId: string) {
    return this.enrollmentsService.findByUser(userId);
  }

  @Get('section/:sectionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  findBySection(@Param('sectionId') sectionId: string) {
    return this.enrollmentsService.findBySection(sectionId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ATHLETE)
  enroll(
    @Body() dto: CreateEnrollmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.enroll(dto, userId);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ATHLETE)
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.cancel(id, userId);
  }
}
