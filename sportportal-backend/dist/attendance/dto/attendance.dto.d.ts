export declare class AttendanceRecordDto {
    enrollmentId: string;
    sectionId: string;
    userId: string;
    date: string;
    present: boolean;
    note?: string;
}
export declare class MarkAttendanceDto {
    records: AttendanceRecordDto[];
}
