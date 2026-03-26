import { UserRole } from '../common/enums/user-role.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    patronymic: string;
    phone: string;
    city: string;
    sport: string;
    birthDate: string;
    bio: string;
    avatar: string;
    createdAt: Date;
}
