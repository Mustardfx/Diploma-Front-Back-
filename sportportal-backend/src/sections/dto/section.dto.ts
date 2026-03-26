import {
  IsString, IsNumber, IsBoolean, IsOptional,
  IsArray, ValidateNested, Min, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleItem } from '../section.entity';

export class ScheduleItemDto implements ScheduleItem {
  @IsInt()
  @Min(0)
  dayOfWeek: number;

  @IsString()
  timeStart: string;

  @IsString()
  timeEnd: string;
}

export class CreateSectionDto {
  @IsString()
  name: string;

  @IsString()
  sport: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];

  @IsInt()
  @Min(1)
  maxParticipants: number;

  @IsOptional()
  @IsInt()
  ageMin?: number;

  @IsOptional()
  @IsInt()
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSectionDto {
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule?: ScheduleItemDto[];

  @IsOptional()
  @IsInt()
  maxParticipants?: number;

  @IsOptional()
  @IsInt()
  ageMin?: number;

  @IsOptional()
  @IsInt()
  ageMax?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SectionFilterDto {
  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
