import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
  allDrivers: Driver[];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog,
    public route: ActivatedRoute,
    private router: Router
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
      cusVehicleNumber: ['', Validators.required],
      docId: ['']
    });

    if (this.router.getCurrentNavigation()?.extras.state) {
      const tripDetails = this.router.getCurrentNavigation()?.extras.state;
      console.log(tripDetails);

      if (tripDetails?.['path'] === 'EDIT_DRIVER_BOOKING') {
        this.driverBookingForm.controls['customerName'].setValue(tripDetails?.['rowData'].customerName);
        this.driverBookingForm.controls['address'].setValue(tripDetails?.['rowData'].address);
        this.driverBookingForm.controls['pickUpLocation'].setValue(tripDetails?.['rowData'].pickUpLocation);
        this.driverBookingForm.controls['dropOffLocation'].setValue(tripDetails?.['rowData'].dropOffLocation);
        this.driverBookingForm.controls['customerNumber'].setValue(tripDetails?.['rowData'].customerNumber);
        this.driverBookingForm.controls['startDate'].setValue(tripDetails?.['rowData'].startDate);
        this.driverBookingForm.controls['endDate'].setValue(tripDetails?.['rowData'].endDate);
        this.driverBookingForm.controls['startTime'].setValue(tripDetails?.['rowData'].startTime);
        this.driverBookingForm.controls['numberOfDays'].setValue(tripDetails?.['rowData'].numberOfDays);
        this.driverBookingForm.controls['requiredDriver'].setValue(tripDetails?.['rowData'].requiredDriver);
        this.driverBookingForm.controls['rejectedDriver'].setValue(tripDetails?.['rowData'].rejectedDriver);
        this.driverBookingForm.controls['cusVehicleType'].setValue(tripDetails?.['rowData'].cusVehicleType);
        this.driverBookingForm.controls['cusVehicleNumber'].setValue(tripDetails?.['rowData'].cusVehicleNumber);
        this.driverBookingForm.controls['cusVehicleName'].setValue(tripDetails?.['rowData'].cusVehicleName);
      }
    }
  }

  ngOnInit(): void {
    this.getAllDrivers();
  }

  onInputDate() {
    this.utilityService.updateDaysDifference(this.driverBookingForm);
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

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
      if (res && res.length > 0) {
        this.allDrivers = res;
      }
    });
  }

  addDriverBooking() {
    const inputValue = this.driverBookingForm.controls['startTime'].value;
    this.driverBookingForm.controls['startTime'].setValue(this.utilityService.convertTo12HourFormat(inputValue));

    const docId = this.firebaseService.createId();
    this.driverBookingForm.controls['docId'].setValue(docId);

    this.firebaseService
      .addDriverBooking(this.driverBookingForm.value)
      .then((res) => {
        this.snackBar.showMessage('Driver Booking Successfully Added');
        this.driverBookingForm.reset();
      })
      .catch((error) => {
        console.error('Error adding driver booking:', error);
        this.snackBar.showMessage('Error Adding Driver Booking');
      });
  }
}

export interface Driver {
  name: string;
  code: string;
}
