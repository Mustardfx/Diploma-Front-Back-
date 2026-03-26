import { Repository } from 'typeorm';
import { CompetitionRegistration } from './registration.entity';
import { CreateRegistrationDto, UpdateRegistrationStatusDto } from './dto/registration.dto';
import { CompetitionsService } from '../competitions/competitions.service';
export declare class RegistrationsService {
    private readonly repo;
    private readonly competitionsService;
    constructor(repo: Repository<CompetitionRegistration>, competitionsService: CompetitionsService);
    findByUser(userId: string): Promise<CompetitionRegistration[]>;
    findByCompetition(competitionId: string): Promise<CompetitionRegistration[]>;
    register(dto: CreateRegistrationDto, userId: string): Promise<CompetitionRegistration>;
    withdraw(id: string, userId: string): Promise<CompetitionRegistration>;
    updateStatus(id: string, dto: UpdateRegistrationStatusDto): Promise<CompetitionRegistration>;
}
