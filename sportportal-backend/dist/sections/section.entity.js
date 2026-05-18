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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
let Section = class Section {
};
exports.Section = Section;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Section.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Section.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Section.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coach_id', nullable: true }),
    __metadata("design:type", String)
], Section.prototype, "coachId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", user_entity_1.User)
], Section.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Section.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Section.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], Section.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_participants' }),
    __metadata("design:type", Number)
], Section.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'age_min', nullable: true }),
    __metadata("design:type", Number)
], Section.prototype, "ageMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'age_max', nullable: true }),
    __metadata("design:type", Number)
], Section.prototype, "ageMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Number)
], Section.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Section.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Section.prototype, "createdAt", void 0);
exports.Section = Section = __decorate([
    (0, typeorm_1.Entity)('sections')
], Section);
//# sourceMappingURL=section.entity.js.map