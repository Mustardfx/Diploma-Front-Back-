import { User } from '../users/user.entity';
export interface ScheduleItem {
    dayOfWeek: number;
    timeStart: string;
    timeEnd: string;
}
export declare class Section {
    id: string;
    name: string;
    sport: string;
    coachId: string;
    coach: User;
    description: string;
    location: string;
    schedule: ScheduleItem[];
    maxParticipants: number;
    ageMin: number;
    ageMax: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
}
