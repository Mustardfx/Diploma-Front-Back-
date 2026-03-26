import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import {
  CreateCompetitionDto,
  UpdateCompetitionDto,
  CompetitionFilterDto,
} from './dto/competition.dto';
import { Jwt } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('competitions')
  @UseGuards(Jwt)
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  findAll(@Query() filter: CompetitionFilterDto) {
    return this.competitionsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competitionsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateCompetitionDto,
    @CurrentUser('id') organizerId: string,
  ) {
    return this.competitionsService.create(dto, organizerId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.competitionsService.remove(id);
  }
}
