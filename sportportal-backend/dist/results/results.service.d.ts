import { Repository } from 'typeorm';
import { CompetitionResult } from './result.entity';
import { CreateResultDto } from './dto/result.dto';
export declare class ResultsService {
    private readonly repo;
    constructor(repo: Repository<CompetitionResult>);
    findByCompetition(competitionId: string): Promise<CompetitionResult[]>;
    findByUser(userId: string): Promise<CompetitionResult[]>;
    save(dto: CreateResultDto, judgeId: string): Promise<CompetitionResult>;
    remove(id: string): Promise<void>;
}
