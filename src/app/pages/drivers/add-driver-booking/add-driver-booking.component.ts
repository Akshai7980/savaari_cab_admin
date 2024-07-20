import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutocapitalizeDirective } from 'src/app/directives/autocapitalize.directive';
import { VehicleNumberDirective } from 'src/app/directives/vehicle-number.directive';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ListAllDriversComponent } from 'src/app/theme/shared/components/list-all-drivers/list-all-drivers.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-add-driver-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AutocapitalizeDirective, VehicleNumberDirective],
  templateUrl: './add-driver-booking.component.html',
  styleUrls: ['./add-driver-booking.component.scss']
})
export default class AddDriverBookingComponent implements OnInit {
  @ViewChild('startDateInput') startDateInput: HTMLInputElement;
  @ViewChild('endDateInput') endDateInput: HTMLInputElement;

  private drivers: Driver[] = [];
  private readonly subscription: Subscription[] = [];

  public editForm: boolean;

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
    docId: [''],
    status: [''],
    selectedDriver: ['']
  });

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly utilityService: UtilityService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly matDialog: MatDialog
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
    const subscription = this.route.queryParamMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.editForm = true;
        this.firebaseService.getBookingDetailById(id).then((data: { startTime: string }) => {
          data.startTime = data.startTime ? this.utilityService.convertTo24Hour(data.startTime) : '';
          this.driverBookingForm.patchValue(data);
        });
      }
    });
    this.subscription.push(subscription);
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

    const dialogRef = this.matDialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.drivers }
    });

    const subscription = dialogRef.afterClosed().subscribe((selectedDrivers: Driver[]) => {
      console.log(`Dialog result: ${selectedDrivers}`);
    });

    this.subscription.push(subscription);
  }

  getDrivers() {
    const subscription = this.firebaseService.getUserOTPs().subscribe((drivers) => {
      this.drivers = drivers || [];
    });
    this.subscription.push(subscription);
  }

  addDriverBooking() {
    const inputValue = this.driverBookingForm.controls['startTime'].value;
    this.driverBookingForm.controls['startTime'].setValue(this.utilityService.convertTo12HourFormat(inputValue));

    this.driverBookingForm.controls['status'].setValue('yts');

    if (!this.editForm) {
      const docId = this.firebaseService.createId();
      this.driverBookingForm.controls['docId'].setValue(docId);
      this.firebaseService
        .addDriverBooking(this.driverBookingForm.value)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.driverBookingForm.reset();
          this.initializeDateValues();
        })
        .catch((error) => {
          console.error('Error adding driver booking:', error);
          this.utilityService.successFailedPopup('FAILED');
          this.driverBookingForm.reset();
          this.initializeDateValues();
        });
    } else {
      this.firebaseService.updateBookingDetailById(this.driverBookingForm.value).then(() => {
        this.router.navigate(['/driverBookingList']);
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.forEach((element) => {
        element.unsubscribe();
      });
  }
}

export interface Driver {
  name: string;
  code: string;
}
