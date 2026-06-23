import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './section.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Section, Enrollment])],
  providers: [SectionsService],
  controllers: [SectionsController],
  exports: [SectionsService],
})
export class SectionsModule {}
