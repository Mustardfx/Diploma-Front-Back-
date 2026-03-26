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
exports.CompetitionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const competition_entity_1 = require("./competition.entity");
const uuid_1 = require("uuid");
let CompetitionsService = class CompetitionsService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(filter = {}) {
        const where = {};
        if (filter.sport)
            where.sport = filter.sport;
        if (filter.status)
            where.status = filter.status;
        return this.repo.find({ where, order: { startDate: 'ASC' } });
    }
    async findOne(id) {
        const comp = await this.repo.findOneBy({ id });
        if (!comp)
            throw new common_1.NotFoundException('Соревнование не найдено');
        return comp;
    }
    create(dto, organizerId) {
        const categories = dto.categories.map((c) => ({ ...c, id: (0, uuid_1.v4)() }));
        const comp = this.repo.create({ ...dto, categories, organizerId });
        return this.repo.save(comp);
    }
    async update(id, dto) {
        const comp = await this.findOne(id);
        if (dto.categories) {
            dto.categories = dto.categories.map((c) => ({
                ...c,
                id: c.id ?? (0, uuid_1.v4)(),
            }));
        }
        Object.assign(comp, dto);
        return this.repo.save(comp);
    }
    async remove(id) {
        const comp = await this.findOne(id);
        await this.repo.remove(comp);
    }
};
exports.CompetitionsService = CompetitionsService;
exports.CompetitionsService = CompetitionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(competition_entity_1.Competition)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CompetitionsService);
//# sourceMappingURL=competitions.service.js.map