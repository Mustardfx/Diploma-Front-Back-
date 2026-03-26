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
exports.CompetitionRegistration = exports.RegistrationStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const competition_entity_1 = require("../competitions/competition.entity");
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "pending";
    RegistrationStatus["APPROVED"] = "approved";
    RegistrationStatus["REJECTED"] = "rejected";
    RegistrationStatus["WITHDRAWN"] = "withdrawn";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
let CompetitionRegistration = class CompetitionRegistration {
};
exports.CompetitionRegistration = CompetitionRegistration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompetitionRegistration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competition_id' }),
    __metadata("design:type", String)
], CompetitionRegistration.prototype, "competitionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => competition_entity_1.Competition),
    (0, typeorm_1.JoinColumn)({ name: 'competition_id' }),
    __metadata("design:type", competition_entity_1.Competition)
], CompetitionRegistration.prototype, "competition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], CompetitionRegistration.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], CompetitionRegistration.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], CompetitionRegistration.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RegistrationStatus,
        default: RegistrationStatus.PENDING,
    }),
    __metadata("design:type", String)
], CompetitionRegistration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'judge_id', nullable: true }),
    __metadata("design:type", String)
], CompetitionRegistration.prototype, "judgeId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'registered_at' }),
    __metadata("design:type", Date)
], CompetitionRegistration.prototype, "registeredAt", void 0);
exports.CompetitionRegistration = CompetitionRegistration = __decorate([
    (0, typeorm_1.Entity)('competition_registrations')
], CompetitionRegistration);
//# sourceMappingURL=registration.entity.js.map