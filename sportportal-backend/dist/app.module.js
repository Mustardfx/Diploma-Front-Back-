"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const sections_module_1 = require("./sections/sections.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const attendance_module_1 = require("./attendance/attendance.module");
const competitions_module_1 = require("./competitions/competitions.module");
const registrations_module_1 = require("./registrations/registrations.module");
const results_module_1 = require("./results/results.module");
const data_source_1 = require("./db/data-source");
const dotenv = require("dotenv");
dotenv.config();
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(data_source_1.dataSourceOptions),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            sections_module_1.SectionsModule,
            enrollments_module_1.EnrollmentsModule,
            attendance_module_1.AttendanceModule,
            competitions_module_1.CompetitionsModule,
            registrations_module_1.RegistrationsModule,
            results_module_1.ResultsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map