export interface DriverLeave {
    docId?: string;
    driverName: string;
    driverCode: string;
    leaveStartDate: string;
    leaveEndDate: string;
    leaveReason: string;
    leaveType: string;
    numberOfDays: string | number;
    driverMobileNumber?: number | string;
    driverType?: string;
    isLeaveCancelled?: boolean;
    leaveCancelledAt?: string | Date;
    cancelledBy?: string;
    status: string;
}
