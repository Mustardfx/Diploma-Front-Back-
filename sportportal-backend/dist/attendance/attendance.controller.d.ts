import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findBySection(sectionId: string, date?: string): Promise<import("./attendance.entity").Attendance[]>;
    getUserStats(userId: string, sectionId: string): Promise<{
        total: number;
        present: number;
        percent: number;
    }>;
    mark(dto: MarkAttendanceDto): Promise<import("./attendance.entity").Attendance[]>;
}
