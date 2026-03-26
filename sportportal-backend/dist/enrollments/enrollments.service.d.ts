import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { SectionsService } from '../sections/sections.service';
export declare class EnrollmentsService {
    private readonly repo;
    private readonly sectionsService;
    constructor(repo: Repository<Enrollment>, sectionsService: SectionsService);
    findByUser(userId: string): Promise<Enrollment[]>;
    findBySection(sectionId: string): Promise<Enrollment[]>;
    enroll(dto: CreateEnrollmentDto, userId: string): Promise<Enrollment>;
    cancel(id: string, userId: string): Promise<Enrollment>;
}
