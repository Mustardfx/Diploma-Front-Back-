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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const sections_service_1 = require("../sections/sections.service");
let EnrollmentsService = class EnrollmentsService {
    constructor(repo, sectionsService) {
        this.repo = repo;
        this.sectionsService = sectionsService;
    }
    findByUser(userId) {
        return this.repo.find({
            where: { userId, status: enrollment_entity_1.EnrollmentStatus.ACTIVE },
            relations: ['section', 'section.coach'],
            order: { enrolledAt: 'DESC' },
        });
    }
    findBySection(sectionId) {
        return this.repo.find({
            where: { sectionId, status: enrollment_entity_1.EnrollmentStatus.ACTIVE },
            relations: ['user'],
            order: { enrolledAt: 'ASC' },
        });
    }
    async enroll(dto, userId) {
        const section = await this.sectionsService.findOne(dto.sectionId);
        if (!section.isActive) {
            throw new common_1.BadRequestException('Секция закрыта для записи');
        }
        const existing = await this.repo.findOne({
            where: { sectionId: dto.sectionId, userId, status: enrollment_entity_1.EnrollmentStatus.ACTIVE },
        });
        if (existing) {
            throw new common_1.ConflictException('Вы уже записаны на эту секцию');
        }
        const count = await this.repo.count({
            where: { sectionId: dto.sectionId, status: enrollment_entity_1.EnrollmentStatus.ACTIVE },
        });
        if (count >= section.maxParticipants) {
            throw new common_1.BadRequestException('Все места заняты');
        }
        const enrollment = this.repo.create({
            sectionId: dto.sectionId,
            userId,
            status: enrollment_entity_1.EnrollmentStatus.ACTIVE,
        });
        return this.repo.save(enrollment);
    }
    async cancel(id, userId) {
        const enrollment = await this.repo.findOne({ where: { id, userId } });
        if (!enrollment)
            throw new common_1.NotFoundException('Запись не найдена');
        if (enrollment.status !== enrollment_entity_1.EnrollmentStatus.ACTIVE) {
            throw new common_1.BadRequestException('Запись уже неактивна');
        }
        enrollment.status = enrollment_entity_1.EnrollmentStatus.CANCELLED;
        return this.repo.save(enrollment);
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sections_service_1.SectionsService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map