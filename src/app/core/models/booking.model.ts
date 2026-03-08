export interface DriverBooking {
    docId?: string;
    customerName: string;
    address: string;
    pickUpLocation: string;
    dropOffLocation: string;
    customerNumber: string;
    startDate: string;
    endDate: string;
    startTime: string;
    numberOfDays: string;
    requiredDriver: string;
    rejectedDriver?: string;
    cusVehicleName: string;
    cusVehicleType: string;
    cusVehicleNumber: string;
    status: string;
    isTripCancelled?: boolean;
    tripCancellationTime?: string;
    tripCancelledBy?: string;
    selectedDriver?: string;
}
export interface DriverLeave {
    docId: string;
    driverName: string;
    leaveReason: string;
    leaveStartDate: string;
    leaveEndDate: string;
    numberOfDays: string;
    leaveType: string;
    driverMobileNumber: string;
    createdAt: Date;
    driverCode: string;
    driverId: string;
    driverType: string;
    leaveAppliedBy: string;
}
