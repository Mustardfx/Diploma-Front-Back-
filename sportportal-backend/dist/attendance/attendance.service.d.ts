import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { MarkAttendanceDto } from './dto/attendance.dto';
export declare class AttendanceService {
    private readonly repo;
    constructor(repo: Repository<Attendance>);
    findBySection(sectionId: string, date?: string): Promise<Attendance[]>;
    getUserStats(userId: string, sectionId: string): Promise<{
        total: number;
        present: number;
        percent: number;
    }>;
    markAttendance(dto: MarkAttendanceDto): Promise<Attendance[]>;
}
