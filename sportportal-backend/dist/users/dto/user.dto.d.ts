import { User } from './../user.entity';
export declare class UserDto {
    id: string;
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    constructor(entity: User);
}
