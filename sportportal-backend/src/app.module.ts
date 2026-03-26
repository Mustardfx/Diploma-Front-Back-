import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { ResultsModule } from './results/results.module';
import { dataSourceOptions } from './db/data-source';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    SectionsModule,
    EnrollmentsModule,
    AttendanceModule,
    CompetitionsModule,
    RegistrationsModule,
    ResultsModule,
  ],
})
export class AppModule {}
