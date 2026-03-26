import { User } from '../users/user.entity';
import { Competition } from '../competitions/competition.entity';
import { CompetitionRegistration } from '../registrations/registration.entity';
export declare class CompetitionResult {
    id: string;
    competitionId: string;
    competition: Competition;
    registrationId: string;
    registration: CompetitionRegistration;
    userId: string;
    user: User;
    categoryId: string;
    place: number;
    score: number;
    notes: string;
    judgeId: string;
    judge: User;
    recordedAt: Date;
}
