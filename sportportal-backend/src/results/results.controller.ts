import {
  Controller, Get, Post, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultDto, LessonPointsDto } from './dto/result.dto';
import { Jwt } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('results')
  @UseGuards(Jwt)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('competition/:competitionId')
  findByCompetition(@Param('competitionId') competitionId: string) {
    return this.resultsService.findByCompetition(competitionId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.resultsService.findByUser(userId);
  }

  // ─── Баллы за уроки ──────────────────────────────────────────────
  @Get('leaderboard')
  leaderboard() {
    return this.resultsService.leaderboard();
  }

  @Get('leaderboard/section/:sectionId')
  leaderboardBySection(@Param('sectionId') sectionId: string) {
    return this.resultsService.leaderboard(sectionId);
  }

  @Get('lesson/section/:sectionId')
  findLessonPoints(@Param('sectionId') sectionId: string) {
    return this.resultsService.findLessonPoints(sectionId);
  }

  @Post('lesson')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  saveLessonPoints(
    @Body() dto: LessonPointsDto,
    @CurrentUser('id') coachId: string,
  ) {
    return this.resultsService.saveLessonPoints(dto, coachId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.JUDGE, UserRole.ADMIN)
  save(
    @Body() dto: CreateResultDto,
    @CurrentUser('id') judgeId: string,
  ) {
    return this.resultsService.save(dto, judgeId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JUDGE, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.resultsService.remove(id);
  }
}
