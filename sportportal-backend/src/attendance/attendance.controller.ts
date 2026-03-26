import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/attendance.dto';
import {  } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('attendance')
@UseGuards()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  findBySection(
    @Query('sectionId') sectionId: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findBySection(sectionId, date);
  }

  @Get('stats/:userId/:sectionId')
  getUserStats(
    @Param('userId') userId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.attendanceService.getUserStats(userId, sectionId);
  }

  @Post('mark')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  mark(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }
}
