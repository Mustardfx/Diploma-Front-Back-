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
exports.Enrollment = exports.EnrollmentStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const section_entity_1 = require("../sections/section.entity");
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "active";
    EnrollmentStatus["COMPLETED"] = "completed";
    EnrollmentStatus["CANCELLED"] = "cancelled";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
let Enrollment = class Enrollment {
};
exports.Enrollment = Enrollment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Enrollment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'section_id' }),
    __metadata("design:type", String)
], Enrollment.prototype, "sectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => section_entity_1.Section),
    (0, typeorm_1.JoinColumn)({ name: 'section_id' }),
    __metadata("design:type", section_entity_1.Section)
], Enrollment.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Enrollment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Enrollment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Enrollment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'enrolled_at' }),
    __metadata("design:type", Date)
], Enrollment.prototype, "enrolledAt", void 0);
exports.Enrollment = Enrollment = __decorate([
    (0, typeorm_1.Entity)('enrollments')
], Enrollment);
//# sourceMappingURL=enrollment.entity.js.map