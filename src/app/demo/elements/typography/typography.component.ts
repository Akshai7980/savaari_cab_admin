import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ListAllDriversComponent } from 'src/app/modals/list-all-drivers/list-all-drivers.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.scss']
})
export default class TypographyComponent {
  @ViewChild('startDateInput') startDateInput: HTMLInputElement;
  @ViewChild('endDateInput') endDateInput: HTMLInputElement;

  driverBookingForm: FormGroup;
  formattedTime: string;
  timePickerInput: any;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) {
    this.driverBookingForm = this.formBuilder.group({
      customer_name: ['', Validators.required],
      address: ['', Validators.required],
      pickUpLocation: ['', Validators.required],
      dropOffLocation: ['', Validators.required],
      customer_number: ['', Validators.required],
      bookingDate: ['', Validators.required],
      endDate: ['', Validators.required],
      timePicker: ['', Validators.required],
      numberOfDays: ['', Validators.required],
      tripClosedDrierName: ['', Validators.required],
      vehicleType: ['', Validators.required],
      tripClosedDrierMobile: ['', Validators.required]
    });
  }

  onInputDate() {
    const startDate = this.startDateInput.value;
    const endDate = this.endDateInput.value;

    if (startDate && endDate) {
      const daysDifference = this.utilityService.calculateDaysDifference(startDate, endDate);
      this.driverBookingForm.controls['numberOfDays'].setValue(daysDifference);
    }
  }

  onInputTime() {
    const inputValue = this.timePickerInput.value;
    this.formattedTime = this.utilityService.convertTo12HourFormat(inputValue);
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '500px';
    dialogConfig.maxHeight = '500px';

    const dialogRef = this.dialog.open(ListAllDriversComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  addDriverBooking() {
    this.driverBookingForm.controls['timePicker'].setValue(this.formattedTime);
    this.firebaseService
      .addDriverBooking(this.driverBookingForm.value)
      .then((res) => {
        this.driverBookingForm.reset();
        this.snackBar.showMessage('Driver Booking Successfully Added');
        console.log('Successfully added:', res);
      })
      .catch((error) => {
        this.snackBar.showMessage('Error Adding Driver Booking');
        console.error('Error adding driver booking:', error);
      });
  }
}
