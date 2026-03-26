import { User } from '../users/user.entity';
export declare enum CompetitionStatus {
    UPCOMING = "upcoming",
    ONGOING = "ongoing",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export interface CompetitionCategory {
    id: string;
    name: string;
    ageMin?: number;
    ageMax?: number;
    weightClass?: string;
}
export declare class Competition {
    id: string;
    name: string;
    sport: string;
    organizerId: string;
    organizer: User;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    maxParticipants: number;
    status: CompetitionStatus;
    categories: CompetitionCategory[];
    createdAt: Date;
}
