import { User } from '../users/user.entity';
import { Competition } from '../competitions/competition.entity';
export declare enum RegistrationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    WITHDRAWN = "withdrawn"
}
export declare class CompetitionRegistration {
    id: string;
    competitionId: string;
    competition: Competition;
    userId: string;
    user: User;
    categoryId: string;
    status: RegistrationStatus;
    judgeId: string;
    registeredAt: Date;
}
