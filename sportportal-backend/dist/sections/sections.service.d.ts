import { Repository } from 'typeorm';
import { Section } from './section.entity';
import { CreateSectionDto, UpdateSectionDto, SectionFilterDto } from './dto/section.dto';
import { UserRole } from '../common/enums/user-role.enum';
export declare class SectionsService {
    private readonly repo;
    constructor(repo: Repository<Section>);
    findAll(filter?: SectionFilterDto): Promise<Section[]>;
    findOne(id: string): Promise<Section>;
    findByCoach(coachId: string): Promise<Section[]>;
    create(dto: CreateSectionDto, coachId: string): Promise<Section>;
    update(id: string, dto: UpdateSectionDto, requesterId: string, requesterRole: UserRole): Promise<Section>;
    remove(id: string, requesterId: string, requesterRole: UserRole): Promise<void>;
}
