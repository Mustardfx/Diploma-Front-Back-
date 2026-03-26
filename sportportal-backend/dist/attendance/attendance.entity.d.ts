import { User } from '../users/user.entity';
import { Section } from '../sections/section.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
export declare class Attendance {
    id: string;
    enrollmentId: string;
    enrollment: Enrollment;
    sectionId: string;
    section: Section;
    userId: string;
    user: User;
    date: string;
    present: boolean;
    note: string;
    createdAt: Date;
}
