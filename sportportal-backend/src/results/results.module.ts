import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetitionResult } from './result.entity';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionResult])],
  providers: [ResultsService],
  controllers: [ResultsController],
  exports: [ResultsService],
})
export class ResultsModule {}
