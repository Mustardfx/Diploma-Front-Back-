import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto, UpdateCompetitionDto, CompetitionFilterDto } from './dto/competition.dto';
export declare class CompetitionsController {
    private readonly competitionsService;
    constructor(competitionsService: CompetitionsService);
    findAll(filter: CompetitionFilterDto): Promise<import("./competition.entity").Competition[]>;
    findOne(id: string): Promise<import("./competition.entity").Competition>;
    create(dto: CreateCompetitionDto, organizerId: string): Promise<import("./competition.entity").Competition>;
    update(id: string, dto: UpdateCompetitionDto): Promise<import("./competition.entity").Competition>;
    remove(id: string): Promise<void>;
}
