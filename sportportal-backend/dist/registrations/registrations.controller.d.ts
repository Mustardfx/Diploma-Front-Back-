import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto, UpdateRegistrationStatusDto } from './dto/registration.dto';
export declare class RegistrationsController {
    private readonly registrationsService;
    constructor(registrationsService: RegistrationsService);
    findMine(userId: string): Promise<import("./registration.entity").CompetitionRegistration[]>;
    findByCompetition(competitionId: string): Promise<import("./registration.entity").CompetitionRegistration[]>;
    register(dto: CreateRegistrationDto, userId: string): Promise<import("./registration.entity").CompetitionRegistration>;
    withdraw(id: string, userId: string): Promise<import("./registration.entity").CompetitionRegistration>;
    updateStatus(id: string, dto: UpdateRegistrationStatusDto): Promise<import("./registration.entity").CompetitionRegistration>;
}
