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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("./attendance.entity");
let AttendanceService = class AttendanceService {
    constructor(repo) {
        this.repo = repo;
    }
    findBySection(sectionId, date) {
        const where = { sectionId };
        if (date)
            where.date = date;
        return this.repo.find({
            where,
            relations: ['user'],
            order: { date: 'DESC' },
        });
    }
    async getUserStats(userId, sectionId) {
        const records = await this.repo.find({ where: { userId, sectionId } });
        const present = records.filter((r) => r.present).length;
        const total = records.length;
        return {
            total,
            present,
            percent: total > 0 ? Math.round((present / total) * 100) : 0,
        };
    }
    async markAttendance(dto) {
        const saved = [];
        for (const rec of dto.records) {
            const existing = await this.repo.findOne({
                where: { userId: rec.userId, sectionId: rec.sectionId, date: rec.date },
            });
            if (existing) {
                existing.present = rec.present;
                existing.note = rec.note ?? null;
                saved.push(await this.repo.save(existing));
            }
            else {
                const record = this.repo.create(rec);
                saved.push(await this.repo.save(record));
            }
        }
        return saved;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map