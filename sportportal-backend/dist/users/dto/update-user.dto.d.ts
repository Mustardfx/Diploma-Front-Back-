import { UserRole } from '../../common/enums/user-role.enum';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    phone?: string;
    city?: string;
    sport?: string;
    birthDate?: string;
    bio?: string;
}
export declare class UpdateRoleDto {
    role: UserRole;
}
