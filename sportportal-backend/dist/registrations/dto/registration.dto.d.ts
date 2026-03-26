import { RegistrationStatus } from '../registration.entity';
export declare class CreateRegistrationDto {
    competitionId: string;
    categoryId: string;
}
export declare class UpdateRegistrationStatusDto {
    status: RegistrationStatus;
}
