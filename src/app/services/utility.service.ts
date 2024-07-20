import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AlertPopupComponent } from '../theme/shared/components/alert-popup/alert-popup.component';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private dialogRef;
  private assetsPath: string = '../../../../../assets/images/';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly http: HttpClient,
    private readonly matDialog: MatDialog
  ) {}

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

    const checkTokenUniqueness = (token: string, registeredDrivers: any[]) => {
      return !registeredDrivers.some((driver) => driver.driverCode === token);
    };

    const generateUniqueToken = async () => {
      try {
        const registeredDrivers = await firstValueFrom(this.firebaseService.getRegisteredDrivers());
        let token = generateRandomToken();
        let attempts = 0;

        while (attempts < maxAttempts) {
          if (checkTokenUniqueness(token, registeredDrivers)) {
            return token;
          }
          token = generateRandomToken();
          attempts++;
        }

        throw new Error('Unable to generate a unique token.');
      } catch (error) {
        throw new Error(`Error generating token: ${error.message}`);
      }
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

  // Function to convert time to 24-hour format
  convertTo24Hour(timeString) {
    const [hours, minutes] = timeString.split(':');
    const [minute, period] = minutes.split(' ');

    let convertedHours = hours;
    if (period && period.toUpperCase() === 'PM') {
      convertedHours = parseInt(hours, 10) + 12;
    } else if (period && period.toUpperCase() === 'AM' && hours === '12') {
      convertedHours = '00';
    }

    return `${convertedHours}:${minute} ${period}`;
  }

  getData(url: string) {
    return this.http.get(url);
  }

  formatLicensePlate(input: string): string {
    const sanitizedValue = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;
    const validVehicleNumber = vehicleNumberRegex.test(sanitizedValue);

    let formattedValue = sanitizedValue;
    if (validVehicleNumber) {
      formattedValue = sanitizedValue.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{1,3})([0-9]{4})$/, '$1 $2 $3 $4');
    }

    return formattedValue;
  }

  successFailedPopup(alertType: string) {
    const isSuccess = alertType === 'SUCCESS';

    const dialogConfig = new MatDialogConfig();

    dialogConfig.height = '400px';
    dialogConfig.width = '600px';

    dialogConfig.data = {
      icon: 'close',
      image: `${this.assetsPath}${isSuccess ? 'success-check-mark.png' : 'failed-icon.png'}`,
      popupType: 'FORM-SUBMIT',
      alertType: alertType,
      heading: isSuccess ? 'Form Submission Successful' : 'Form Submission Failed',
      content: isSuccess ? 'Your form has been submitted successfully. Thank you!' : 'Your form submission failed. Please try again later.',
      buttons: isSuccess ? ['Continue...'] : ['Try Again !'],

      onButtonClick: () => {
        this.dialogRef.close();
      }
    };

    this.dialogRef = this.matDialog.open(AlertPopupComponent, dialogConfig);
  }
}
