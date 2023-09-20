import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private readonly firebaseService: FirebaseService) {}

  calculateDaysDifference(startDate: string, endDate: string): number | null {
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();

    if (!isNaN(startDateTime) && !isNaN(endDateTime)) {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const daysDifference = Math.round((endDateTime - startDateTime) / millisecondsPerDay);

      return daysDifference;
    } else {
      console.error('Invalid date format');
      return null;
    }
  }

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

      return `${hours12}:${minutes} ${ampm}`;
    } else {
      console.error('Invalid time format. Please use HH:mm in 24-hour format.');
      return null;
    }
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
}
