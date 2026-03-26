import { ScheduleItem } from '../section.entity';
export declare class ScheduleItemDto implements ScheduleItem {
    dayOfWeek: number;
    timeStart: string;
    timeEnd: string;
}
export declare class CreateSectionDto {
    name: string;
    sport: string;
    description: string;
    location: string;
    schedule: ScheduleItemDto[];
    maxParticipants: number;
    ageMin?: number;
    ageMax?: number;
    price?: number;
    isActive?: boolean;
}
export declare class UpdateSectionDto {
    name?: string;
    sport?: string;
    description?: string;
    location?: string;
    schedule?: ScheduleItemDto[];
    maxParticipants?: number;
    ageMin?: number;
    ageMax?: number;
    price?: number;
    isActive?: boolean;
}
export declare class SectionFilterDto {
    sport?: string;
    isActive?: boolean;
}
