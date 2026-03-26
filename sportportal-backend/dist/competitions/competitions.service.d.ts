import { Repository } from 'typeorm';
import { Competition } from './competition.entity';
import { CreateCompetitionDto, UpdateCompetitionDto, CompetitionFilterDto } from './dto/competition.dto';
export declare class CompetitionsService {
    private readonly repo;
    constructor(repo: Repository<Competition>);
    findAll(filter?: CompetitionFilterDto): Promise<Competition[]>;
    findOne(id: string): Promise<Competition>;
    create(dto: CreateCompetitionDto, organizerId: string): Promise<Competition>;
    update(id: string, dto: UpdateCompetitionDto): Promise<Competition>;
    remove(id: string): Promise<void>;
}
