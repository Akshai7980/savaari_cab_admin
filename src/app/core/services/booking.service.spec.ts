import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';

describe('BookingService', () => {
    let service: BookingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BookingService);
        // Mocking current time to ensure deterministic tests
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date('2026-03-08T10:00:00'));
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isBookingTimeValid', () => {
        // Current Time: 2026-03-08T10:00:00

        it('should pass if booking is exactly 15 minutes from now (Boundary Check)', () => {
            const startDate = new Date('2026-03-08');
            const startTime = '10:15'; // 10:15 AM
            expect(service.isBookingTimeValid(startDate, startTime)).toBeTrue();
        });

        it('should fail if booking is less than 15 minutes from now (Edge Case)', () => {
            const startDate = new Date('2026-03-08');
            const startTime = '10:14';
            expect(service.isBookingTimeValid(startDate, startTime)).toBeFalse();
        });

        it('should pass if booking is within 15 days in the future', () => {
            const startDate = new Date('2026-03-23'); // 15 days from Mar 8
            const startTime = '10:00';
            expect(service.isBookingTimeValid(startDate, startTime)).toBeTrue();
        });

        it('should fail if booking is more than 15 days in the future', () => {
            const startDate = new Date('2026-03-24');
            const startTime = '10:00';
            expect(service.isBookingTimeValid(startDate, startTime)).toBeFalse();
        });
    });
});
