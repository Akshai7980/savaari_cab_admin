import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Calculate the difference in days between two dates.
   * @param startDate Start date string (format: yyyy-MM-dd).
   * @param endDate End date string (format: yyyy-MM-dd).
   * @returns The difference in days or null if invalid input.
   */
  calculateDaysDifference(startDate: string, endDate: string): number | null {
    const startTimestamp = this.parseDateToTimestamp(startDate);
    const endTimestamp = this.parseDateToTimestamp(endDate);

    if (!startTimestamp || !endTimestamp) {
      return null; // Invalid date format
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round((endTimestamp - startTimestamp) / millisecondsPerDay);
  }

  updateDaysDifference(formGroup: FormGroup) {
    const startDate = formGroup.controls['startDate'].value;
    const endDate = formGroup.controls['endDate'].value;

    console.log(startDate);
    console.log(endDate);

    const daysDifference = this.calculateDaysDifference(startDate, endDate);

    if (daysDifference !== null) {
      formGroup.controls['numberOfDays'].setValue(daysDifference);
    }
  }

  /**
   * Convert a 24-hour time string to 12-hour format.
   * @param inputValue Time string in 24-hour format (HH:mm).
   * @returns The time string in 12-hour format (hh:mm AM/PM) or null if invalid input.
   */
  convertTo12HourFormat(inputValue: string): string | null {
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

    if (timeRegex.test(inputValue)) {
      const [hours, minutes] = inputValue.split(':');
      let ampm = 'AM';
      let hours12 = parseInt(hours, 10);

      if (hours12 >= 12) {
        ampm = 'PM';
        if (hours12 > 12) {
          hours12 -= 12;
        }
      }

      return `${this.zeroPad(hours12)}:${minutes} ${ampm}`;
    } else {
      return null; // Invalid time format
    }
  }

  /**
   * Zero-pad a number if it's a single digit (e.g., 7 becomes '07').
   * @param num The number to zero-pad.
   * @returns The zero-padded string.
   */

  private zeroPad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * Parse a date string to a timestamp.
   * @param dateStr Date string (format: yyyy-MM-dd).
   * @returns The timestamp or null if invalid input.
   */
  private parseDateToTimestamp(dateStr: string): number | null {
    const timestamp = new Date(dateStr).getTime();
    return isNaN(timestamp) ? null : timestamp;
  }

  generateToken(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const tokenLength = 7; // Length of the token
    const maxAttempts = 100; // Maximum number of attempts to generate a unique token

    const generateRandomToken = () => {
      let token = 'SVC';
      for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters[randomIndex];
      }
      return token;
    };

    const checkTokenUniqueness = async (token: string, registeredDrivers: any[]) => {
      return !registeredDrivers.some((driver) => driver.driverCode === token);
    };

    const generateUniqueToken = async () => {
      const registeredDrivers$ = this.firebaseService.getRegisteredDrivers();

      return new Promise<string>((resolve, reject) => {
        let token = generateRandomToken();
        let attempts = 0;

        const subscription = registeredDrivers$.subscribe({
          next: (registeredDrivers) => {
            checkTokenUniqueness(token, registeredDrivers).then((isUnique) => {
              if (isUnique) {
                subscription.unsubscribe();
                resolve(token);
              } else {
                token = generateRandomToken();
                attempts++;

                if (attempts >= maxAttempts) {
                  subscription.unsubscribe();
                  reject('Unable to generate a unique token.');
                }
              }
            });
          },
          error: (error) => {
            subscription.unsubscribe();
            reject(error);
          }
        });
      });
    };

    return generateUniqueToken();
  }

  // To fetch current date -- (DD-MM-YYYY) format
  currentDate() {
    const currentDate = new Date().toISOString().substring(0, 10);
    return currentDate;
  }

  // To fetch current time -- (HH:MM:SS AM/PM) format
  currentTime() {
    const currentTime = new Date().toTimeString().substring(0, 8);
    return currentTime;
  }

  removeKeys(obj, keysToRemove) {
    for (let key of keysToRemove) {
      delete obj[key];
    }
  }
}
