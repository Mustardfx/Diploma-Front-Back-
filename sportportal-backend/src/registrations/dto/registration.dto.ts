import { IsUUID, IsString, IsEnum } from 'class-validator';
import { RegistrationStatus } from '../registration.entity';

export class CreateRegistrationDto {
  @IsUUID()
  competitionId: string;

  @IsString()
  categoryId: string;
}

export class UpdateRegistrationStatusDto {
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;
}
