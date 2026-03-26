import { CompetitionStatus, CompetitionCategory } from '../competition.entity';
export declare class CategoryDto implements Omit<CompetitionCategory, 'id'> {
    name: string;
    ageMin?: number;
    ageMax?: number;
    weightClass?: string;
}
export declare class CreateCompetitionDto {
    name: string;
    sport: string;
    description?: string;
    location: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    maxParticipants: number;
    status?: CompetitionStatus;
    categories: CategoryDto[];
}
export declare class UpdateCompetitionDto {
    name?: string;
    sport?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    registrationDeadline?: string;
    maxParticipants?: number;
    status?: CompetitionStatus;
    categories?: CategoryDto[];
}
export declare class CompetitionFilterDto {
    sport?: string;
    status?: CompetitionStatus;
}
