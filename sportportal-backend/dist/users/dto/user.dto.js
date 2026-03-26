"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = void 0;
class UserDto {
    constructor(entity) {
        this.id = entity.id;
        this.email = entity.email;
        this.password = entity.password;
        this.role = entity.role;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
    }
}
exports.UserDto = UserDto;
//# sourceMappingURL=user.dto.js.map