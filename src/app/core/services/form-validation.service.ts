import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FormValidationService {
    /**
     * Returns the regex pattern for Indian Vehicle Numbers (e.g., KA 01 ME 1234).
     */
    getVehicleNumberRegex(): RegExp {
        return /^[A-Z]{2}\s[0-9]{2}\s[A-Z]{1,2}\s[0-9]{4}$/;
    }

    /**
     * Validates a vehicle number against the official Indian format.
     */
    isValidVehicleNumber(vehicleNumber: string): boolean {
        return this.getVehicleNumberRegex().test(vehicleNumber);
    }
}
