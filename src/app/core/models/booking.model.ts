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
