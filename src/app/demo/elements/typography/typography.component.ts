import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
export default class TypographyComponent implements OnInit {
  @ViewChild('startDateInput') startDateInput: HTMLInputElement;
  @ViewChild('endDateInput') endDateInput: HTMLInputElement;

  driverBookingForm: FormGroup;
  formattedTime: string;
  allDrivers: Driver[];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) {
    this.driverBookingForm = this.formBuilder.group({
      customerName: ['', Validators.required],
      address: ['', Validators.required],
      pickUpLocation: ['', Validators.required],
      dropOffLocation: ['', Validators.required],
      customerNumber: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startTime: ['', Validators.required],
      numberOfDays: ['', Validators.required],
      requiredDriver: ['', Validators.required],
      rejectedDriver: [''],
      cusVehicleName: ['', Validators.required],
      cusVehicleType: ['', Validators.required],
      cusVehicleNumber: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.getAllDrivers();
  }

  onInputDate() {
    this.utilityService.updateDaysDifference(this);
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true; // Enable backdrop

    const dialogRef = this.dialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.allDrivers }
    });

    dialogRef.afterClosed().subscribe((selectedDrivers: Driver[]) => {
      console.log(`Dialog result: ${selectedDrivers}`);
    });
  }

  getAllDrivers() {
    this.firebaseService.getUserOTPs().subscribe((res: any) => {
      console.log('res:', res);
      this.allDrivers = res;
    });
  }

  addDriverBooking() {
    const inputValue = this.driverBookingForm.controls['startTime'].value;

    this.driverBookingForm.controls['startTime'].setValue(this.utilityService.convertTo12HourFormat(inputValue));

    const docId = this.firebaseService.createId();

    this.driverBookingForm.value.docId = docId;

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

export interface Driver {
  name: string;
  code: string;
}
