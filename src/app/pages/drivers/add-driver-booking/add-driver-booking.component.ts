import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ListAllDriversComponent } from 'src/app/theme/shared/components/list-all-drivers/list-all-drivers.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-add-driver-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './add-driver-booking.component.html',
  styleUrls: ['./add-driver-booking.component.scss']
})
export default class AddDriverBookingComponent implements OnInit {
  @ViewChild('startDateInput') startDateInput: HTMLInputElement;
  @ViewChild('endDateInput') endDateInput: HTMLInputElement;

  drivers: Driver[] = [];

  driverBookingForm = this.formBuilder.group({
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

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly utilityService: UtilityService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog
  ) {
    this.handleEditState();
  }

  ngOnInit(): void {
    this.getDrivers();
    this.initializeDateValues();
  }

  onInputDate() {
    this.utilityService.updateDaysDifference(this.driverBookingForm);
  }

  private handleEditState() {
    this.route.queryParamMap.subscribe((params: any) => {
      const id = params.params['id'];
      if (id) {
        this.firebaseService.fetchVehicleDetails(id).then((data: any) => {
          this.driverBookingForm.patchValue(data);
        });
      }
    });
  }

  private initializeDateValues() {
    const currentDate = this.utilityService.currentDate();
    this.driverBookingForm.controls['startDate'].setValue(currentDate);
    this.driverBookingForm.controls['endDate'].setValue(currentDate);
    this.driverBookingForm.controls['startTime'].setValue(this.utilityService.currentTime());
    this.driverBookingForm.controls['numberOfDays'].setValue('1');
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.drivers }
    });

    dialogRef.afterClosed().subscribe((selectedDrivers: Driver[]) => {
      console.log(`Dialog result: ${selectedDrivers}`);
    });
  }

  getDrivers() {
    this.firebaseService.getUserOTPs().subscribe((drivers) => {
      this.drivers = drivers || [];
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
