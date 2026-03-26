import { User } from './../user.entity';
export class UserDto {
    id: string;
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    
    constructor(entity: User) {
        this.id = entity.id;
        this.email = entity.email;
        this.password = entity.password;
        this.role = entity.role;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
    }
}