import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto, SectionFilterDto } from './dto/section.dto';
import { UserRole } from '../common/enums/user-role.enum';
export declare class SectionsController {
    private readonly sectionsService;
    constructor(sectionsService: SectionsService);
    findAll(filter: SectionFilterDto): Promise<import("./section.entity").Section[]>;
    findMine(coachId: string): Promise<import("./section.entity").Section[]>;
    findOne(id: string): Promise<import("./section.entity").Section>;
    create(dto: CreateSectionDto, coachId: string): Promise<import("./section.entity").Section>;
    update(id: string, dto: UpdateSectionDto, requesterId: string, requesterRole: UserRole): Promise<import("./section.entity").Section>;
    remove(id: string, requesterId: string, requesterRole: UserRole): Promise<void>;
}
