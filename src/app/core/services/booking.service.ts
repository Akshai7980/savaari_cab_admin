import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    /**
     * Validates if the booking time is within the allowed range:
     * - Minimum: 15 minutes from the current time.
     * - Maximum: 15 days in the future.
     */
    isBookingTimeValid(startDate: Date, startTime: string): boolean {
        const now = new Date();

        // Combine date and time string into a single Date object
        const [hours, minutes] = startTime.split(':').map(Number);
        const bookingDate = new Date(startDate);
        bookingDate.setHours(hours, minutes, 0, 0);

        const minTime = now.getTime() + 15 * 60 * 1000;
        const maxTime = now.getTime() + 15 * 24 * 60 * 60 * 1000;

        const bookingTime = bookingDate.getTime();
        return bookingTime >= minTime && bookingTime <= maxTime;
    }
}
