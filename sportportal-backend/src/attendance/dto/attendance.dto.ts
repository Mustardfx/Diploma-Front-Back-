import { IsUUID, IsString, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @IsUUID()
  enrollmentId: string;

  @IsUUID()
  sectionId: string;

  @IsUUID()
  userId: string;

  @IsString()
  date: string; // "2026-03-19"

  @IsBoolean()
  present: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class MarkAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
