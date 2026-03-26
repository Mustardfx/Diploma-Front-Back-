import { User } from '../users/user.entity';
import { Section } from '../sections/section.entity';
export declare enum EnrollmentStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Enrollment {
    id: string;
    sectionId: string;
    section: Section;
    userId: string;
    user: User;
    status: EnrollmentStatus;
    enrolledAt: Date;
}
