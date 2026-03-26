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
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const section_entity_1 = require("./section.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let SectionsService = class SectionsService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(filter = {}) {
        const where = {};
        if (filter.sport !== undefined)
            where.sport = filter.sport;
        if (filter.isActive !== undefined)
            where.isActive = filter.isActive;
        return this.repo.find({
            where,
            relations: ['coach'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const section = await this.repo.findOne({
            where: { id },
            relations: ['coach'],
        });
        if (!section)
            throw new common_1.NotFoundException('Секция не найдена');
        return section;
    }
    findByCoach(coachId) {
        return this.repo.find({
            where: { coachId },
            order: { createdAt: 'DESC' },
        });
    }
    create(dto, coachId) {
        const section = this.repo.create({ ...dto, coachId });
        return this.repo.save(section);
    }
    async update(id, dto, requesterId, requesterRole) {
        const section = await this.findOne(id);
        if (section.coachId !== requesterId && requesterRole !== user_role_enum_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Нет доступа к этой секции');
        }
        Object.assign(section, dto);
        return this.repo.save(section);
    }
    async remove(id, requesterId, requesterRole) {
        const section = await this.findOne(id);
        if (section.coachId !== requesterId && requesterRole !== user_role_enum_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Нет доступа к этой секции');
        }
        await this.repo.remove(section);
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(section_entity_1.Section)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SectionsService);
//# sourceMappingURL=sections.service.js.map