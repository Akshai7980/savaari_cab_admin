import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutocapitalizeDirective } from 'src/app/shared/directives/autocapitalize.directive';
import { VehicleNumberDirective } from 'src/app/shared/directives/vehicle-number.directive';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { ListAllDriversComponent } from 'src/app/shared/components/list-all-drivers/list-all-drivers.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Driver } from 'src/app/core/models/driver.model';
import { DriverBooking } from 'src/app/core/models/booking.model';

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
  private destroyRef = inject(DestroyRef);

  // Modern Signal for reactive state
  public isEditMode = signal(false);

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
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: ParamMap) => {
        const id = params.get('id');
        if (id) {
          this.isEditMode.set(true);
          this.firebaseService.getBookingDetailById(id).subscribe((data: DriverBooking | null) => {
            if (data) {
              const patchedData = {
                ...data,
                startTime: data.startTime ? this.utilityService.convertTo24Hour(data.startTime) : ''
              };
              this.driverBookingForm.patchValue(patchedData);
            }
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

    const dialogRef = this.matDialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.drivers }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedDrivers: Driver[]) => {
        console.log(`Dialog result: ${selectedDrivers}`);
      });
  }

  getDrivers() {
    this.firebaseService.getUserOTPs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((drivers) => {
        this.drivers = drivers || [];
      });
  }

  addDriverBooking() {
    const inputValue = this.driverBookingForm.controls['startTime'].value;
    this.driverBookingForm.controls['startTime'].setValue(this.utilityService.convertTo12HourFormat(inputValue));
    this.driverBookingForm.controls['status'].setValue('yts');

    const bookingData = this.driverBookingForm.getRawValue() as DriverBooking;

    if (!this.isEditMode()) {
      const docId = this.firebaseService.createId();
      bookingData.docId = docId;

      this.firebaseService
        .addDriverBooking(bookingData)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.driverBookingForm.reset();
          this.initializeDateValues();
        })
        .catch((error) => {
          console.error('Error adding driver booking:', error);
          this.utilityService.successFailedPopup('FAILED');
        });
    } else {
      if (bookingData.docId) {
        this.firebaseService.updateBookingDetailById(bookingData as DriverBooking & { docId: string }).then(() => {
          this.router.navigate(['/driverBookingList']);
        });
      }
    }
  }
}
