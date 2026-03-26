"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const registration_entity_1 = require("./registration.entity");
const competitions_service_1 = require("../competitions/competitions.service");
const competition_entity_1 = require("../competitions/competition.entity");
let RegistrationsService = class RegistrationsService {
    constructor(repo, competitionsService) {
        this.repo = repo;
        this.competitionsService = competitionsService;
    }
    findByUser(userId) {
        return this.repo.find({
            where: { userId },
            relations: ['competition'],
            order: { registeredAt: 'DESC' },
        });
    }
    findByCompetition(competitionId) {
        return this.repo.find({
            where: { competitionId },
            relations: ['user'],
            order: { registeredAt: 'ASC' },
        });
    }
    async register(dto, userId) {
        const competition = await this.competitionsService.findOne(dto.competitionId);
        if (competition.status === competition_entity_1.CompetitionStatus.COMPLETED ||
            competition.status === competition_entity_1.CompetitionStatus.CANCELLED) {
            throw new common_1.BadRequestException('Регистрация закрыта');
        }
        if (new Date(competition.registrationDeadline) < new Date()) {
            throw new common_1.BadRequestException('Срок регистрации истёк');
        }
        const existing = await this.repo.findOne({
            where: { competitionId: dto.competitionId, userId },
        });
        if (existing && existing.status !== registration_entity_1.RegistrationStatus.WITHDRAWN) {
            throw new common_1.ConflictException('Вы уже зарегистрированы на это соревнование');
        }
        const count = await this.repo.count({
            where: {
                competitionId: dto.competitionId,
                status: registration_entity_1.RegistrationStatus.APPROVED,
            },
        });
        if (count >= competition.maxParticipants) {
            throw new common_1.BadRequestException('Достигнут лимит участников');
        }
        const categoryExists = competition.categories.some((c) => c.id === dto.categoryId);
        if (!categoryExists) {
            throw new common_1.BadRequestException('Категория не найдена');
        }
        if (existing) {
            existing.status = registration_entity_1.RegistrationStatus.PENDING;
            existing.categoryId = dto.categoryId;
            return this.repo.save(existing);
        }
        const reg = this.repo.create({
            competitionId: dto.competitionId,
            userId,
            categoryId: dto.categoryId,
            status: registration_entity_1.RegistrationStatus.PENDING,
        });
        return this.repo.save(reg);
    }
    async withdraw(id, userId) {
        const reg = await this.repo.findOne({ where: { id, userId } });
        if (!reg)
            throw new common_1.NotFoundException('Регистрация не найдена');
        if (reg.status === registration_entity_1.RegistrationStatus.WITHDRAWN) {
            throw new common_1.BadRequestException('Заявка уже отозвана');
        }
        reg.status = registration_entity_1.RegistrationStatus.WITHDRAWN;
        return this.repo.save(reg);
    }
    async updateStatus(id, dto) {
        const reg = await this.repo.findOne({ where: { id } });
        if (!reg)
            throw new common_1.NotFoundException('Регистрация не найдена');
        reg.status = dto.status;
        return this.repo.save(reg);
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registration_entity_1.CompetitionRegistration)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        competitions_service_1.CompetitionsService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map