import { TestBed } from '@angular/core/testing';
import { FormValidationService } from './form-validation.service';

describe('FormValidationService', () => {
    let service: FormValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FormValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isValidVehicleNumber', () => {
        // Format: AA 00 AA 0000

        it('should identify valid Indian license plate formats correctly', () => {
            const validNumbers = [
                'KA 01 ME 1234',
                'DL 10 C 9999',
                'KL 04 BA 0405',
                'MH 12 AB 5678'
            ];
            validNumbers.forEach(num => {
                expect(service.isValidVehicleNumber(num)).toBeTrue();
            });
        });

        it('should reject invalid Indian license plate formats', () => {
            const invalidNumbers = [
                'ABC-123',
                '12 KA 1234',
                'KL04BA0405', // missing spaces
                'KL 04 BA 405',   // insufficient digits at end
                'KA 01 M 1234'    // we support 1 or 2 chars, so this actually might be valid in some regions, 
                // but the regex expects {1,2} so it's fine.
            ];

            expect(service.isValidVehicleNumber('ABC-123')).toBeFalse();
            expect(service.isValidVehicleNumber('12 KA 1234')).toBeFalse();
            expect(service.isValidVehicleNumber('KL04BA0405')).toBeFalse();
            expect(service.isValidVehicleNumber('KL 04 BA 405')).toBeFalse();
        });
    });
});
