import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    getUserById(id: string): Promise<User>;
    create(data: Partial<User>): Promise<User>;
    update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: UserRole): Promise<User>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<User>;
    remove(id: string): Promise<void>;
}
