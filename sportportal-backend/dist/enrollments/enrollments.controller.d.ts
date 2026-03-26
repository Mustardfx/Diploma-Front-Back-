import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    findMine(userId: string): Promise<import("./enrollment.entity").Enrollment[]>;
    findBySection(sectionId: string): Promise<import("./enrollment.entity").Enrollment[]>;
    enroll(dto: CreateEnrollmentDto, userId: string): Promise<import("./enrollment.entity").Enrollment>;
    cancel(id: string, userId: string): Promise<import("./enrollment.entity").Enrollment>;
}
