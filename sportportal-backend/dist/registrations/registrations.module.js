"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const registration_entity_1 = require("./registration.entity");
const registrations_service_1 = require("./registrations.service");
const registrations_controller_1 = require("./registrations.controller");
const competitions_module_1 = require("../competitions/competitions.module");
let RegistrationsModule = class RegistrationsModule {
};
exports.RegistrationsModule = RegistrationsModule;
exports.RegistrationsModule = RegistrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([registration_entity_1.CompetitionRegistration]),
            competitions_module_1.CompetitionsModule,
        ],
        providers: [registrations_service_1.RegistrationsService],
        controllers: [registrations_controller_1.RegistrationsController],
        exports: [registrations_service_1.RegistrationsService],
    })
], RegistrationsModule);
//# sourceMappingURL=registrations.module.js.map