import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto, SectionFilterDto } from './dto/section.dto';
import { Jwt } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('sections')
  @UseGuards(Jwt)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  findAll(@Query() filter: SectionFilterDto) {
    return this.sectionsService.findAll(filter);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  findMine(@CurrentUser('id') coachId: string) {
    return this.sectionsService.findByCoach(coachId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  create(
    @Body() dto: CreateSectionDto,
    @CurrentUser('id') coachId: string,
  ) {
    return this.sectionsService.create(dto, coachId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
  ) {
    return this.sectionsService.update(id, dto, requesterId, requesterRole);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
  ) {
    return this.sectionsService.remove(id, requesterId, requesterRole);
  }
}
