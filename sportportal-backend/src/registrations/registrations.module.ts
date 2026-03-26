import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetitionRegistration } from './registration.entity';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { CompetitionsModule } from '../competitions/competitions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetitionRegistration]),
    CompetitionsModule,
  ],
  providers: [RegistrationsService],
  controllers: [RegistrationsController],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
