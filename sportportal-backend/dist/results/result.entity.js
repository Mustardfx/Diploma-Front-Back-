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
exports.CompetitionResult = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const competition_entity_1 = require("../competitions/competition.entity");
const registration_entity_1 = require("../registrations/registration.entity");
let CompetitionResult = class CompetitionResult {
};
exports.CompetitionResult = CompetitionResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompetitionResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competition_id' }),
    __metadata("design:type", String)
], CompetitionResult.prototype, "competitionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => competition_entity_1.Competition),
    (0, typeorm_1.JoinColumn)({ name: 'competition_id' }),
    __metadata("design:type", competition_entity_1.Competition)
], CompetitionResult.prototype, "competition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_id' }),
    __metadata("design:type", String)
], CompetitionResult.prototype, "registrationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => registration_entity_1.CompetitionRegistration),
    (0, typeorm_1.JoinColumn)({ name: 'registration_id' }),
    __metadata("design:type", registration_entity_1.CompetitionRegistration)
], CompetitionResult.prototype, "registration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], CompetitionResult.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], CompetitionResult.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], CompetitionResult.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CompetitionResult.prototype, "place", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Number)
], CompetitionResult.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CompetitionResult.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'judge_id' }),
    __metadata("design:type", String)
], CompetitionResult.prototype, "judgeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'judge_id' }),
    __metadata("design:type", user_entity_1.User)
], CompetitionResult.prototype, "judge", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'recorded_at' }),
    __metadata("design:type", Date)
], CompetitionResult.prototype, "recordedAt", void 0);
exports.CompetitionResult = CompetitionResult = __decorate([
    (0, typeorm_1.Entity)('competition_results')
], CompetitionResult);
//# sourceMappingURL=result.entity.js.map