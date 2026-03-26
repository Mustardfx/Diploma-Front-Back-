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
exports.Attendance = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const section_entity_1 = require("../sections/section.entity");
const enrollment_entity_1 = require("../enrollments/enrollment.entity");
let Attendance = class Attendance {
};
exports.Attendance = Attendance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Attendance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enrollment_id' }),
    __metadata("design:type", String)
], Attendance.prototype, "enrollmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => enrollment_entity_1.Enrollment),
    (0, typeorm_1.JoinColumn)({ name: 'enrollment_id' }),
    __metadata("design:type", enrollment_entity_1.Enrollment)
], Attendance.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'section_id' }),
    __metadata("design:type", String)
], Attendance.prototype, "sectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => section_entity_1.Section),
    (0, typeorm_1.JoinColumn)({ name: 'section_id' }),
    __metadata("design:type", section_entity_1.Section)
], Attendance.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Attendance.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Attendance.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Attendance.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Attendance.prototype, "present", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Attendance.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Attendance.prototype, "createdAt", void 0);
exports.Attendance = Attendance = __decorate([
    (0, typeorm_1.Entity)('attendance')
], Attendance);
//# sourceMappingURL=attendance.entity.js.map