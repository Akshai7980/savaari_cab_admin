export interface Vehicle {
    docId?: string;
    vehicleName: string;
    vehicleType: string;
    vehicleNumber: string;
    registrationDate?: string;
    vehicleAge?: number | string;
    insuranceDateStart?: string;
    insuranceDateEnd?: string;
    fuelType?: string;
    vehicleClass?: string;
    makeModel?: string;
    smokeClearanceDateStart?: string;
    smokeClearanceDateEnd?: string;
    ownerName?: string;
    ownerNumber?: string;
}
