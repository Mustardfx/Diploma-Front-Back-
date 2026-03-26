import { IsUUID, IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateResultDto {
  @IsUUID()
  competitionId: string;

  @IsUUID()
  registrationId: string;

  @IsUUID()
  userId: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  place?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
