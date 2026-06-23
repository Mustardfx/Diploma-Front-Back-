import {
  IsString, IsOptional, IsInt, IsEnum, IsArray,
  ValidateNested, Min, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CompetitionStatus, CompetitionCategory } from '../competition.entity';

export class CategoryDto implements Partial<CompetitionCategory> {
  // Фронт присылает id (cat_… при создании или реальный uuid при редактировании).
  // При создании сервис перезапишет его на uuid, при обновлении — сохранит существующий.
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  ageMin?: number;

  @IsOptional()
  @IsInt()
  ageMax?: number;

  @IsOptional()
  @IsString()
  weightClass?: string;
}

export class CreateCompetitionDto {
  @IsString()
  name: string;

  @IsString()
  sport: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  registrationDeadline: string;

  @IsInt()
  @Min(2)
  maxParticipants: number;

  @IsOptional()
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}

export class UpdateCompetitionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @IsOptional()
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];
}

export class CompetitionFilterDto {
  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;
}
