import { UsersService } from './users.service';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    getMe(req: any): Promise<UserDto>;
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: UserRole): Promise<User>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<User>;
    remove(id: string): Promise<void>;
}
