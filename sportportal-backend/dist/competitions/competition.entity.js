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
exports.Competition = exports.CompetitionStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
var CompetitionStatus;
(function (CompetitionStatus) {
    CompetitionStatus["UPCOMING"] = "upcoming";
    CompetitionStatus["ONGOING"] = "ongoing";
    CompetitionStatus["COMPLETED"] = "completed";
    CompetitionStatus["CANCELLED"] = "cancelled";
})(CompetitionStatus || (exports.CompetitionStatus = CompetitionStatus = {}));
let Competition = class Competition {
};
exports.Competition = Competition;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Competition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Competition.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Competition.prototype, "sport", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizer_id' }),
    __metadata("design:type", String)
], Competition.prototype, "organizerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_id' }),
    __metadata("design:type", user_entity_1.User)
], Competition.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Competition.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Competition.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", String)
], Competition.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", String)
], Competition.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'registration_deadline', type: 'date' }),
    __metadata("design:type", String)
], Competition.prototype, "registrationDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_participants' }),
    __metadata("design:type", Number)
], Competition.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CompetitionStatus,
        default: CompetitionStatus.UPCOMING,
    }),
    __metadata("design:type", String)
], Competition.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], Competition.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Competition.prototype, "createdAt", void 0);
exports.Competition = Competition = __decorate([
    (0, typeorm_1.Entity)('competitions')
], Competition);
//# sourceMappingURL=competition.entity.js.map