import { User } from './../user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export class UserDto {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    patronymic?: string;
    phone?: string;
    city?: string;
    sport?: string;
    birthDate?: string;
    bio?: string;
    avatar?: string;
    mustChangePassword: boolean;
    createdAt: Date;

    constructor(entity: User) {
        this.id = entity.id;
        this.email = entity.email;
        this.role = entity.role;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
        this.patronymic = entity.patronymic;
        this.phone = entity.phone;
        this.city = entity.city;
        this.sport = entity.sport;
        this.birthDate = entity.birthDate;
        this.bio = entity.bio;
        this.avatar = entity.avatar;
        this.mustChangePassword = entity.mustChangePassword;
        this.createdAt = entity.createdAt;
    }
}
