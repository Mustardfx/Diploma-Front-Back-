import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/result.dto';
export declare class ResultsController {
    private readonly resultsService;
    constructor(resultsService: ResultsService);
    findByCompetition(competitionId: string): Promise<import("./result.entity").CompetitionResult[]>;
    findByUser(userId: string): Promise<import("./result.entity").CompetitionResult[]>;
    save(dto: CreateResultDto, judgeId: string): Promise<import("./result.entity").CompetitionResult>;
    remove(id: string): Promise<void>;
}
