import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FormGeneratorService } from 'src/app/core/services/form-generator.service';
import { FormConfig } from 'src/app/core/models/form-field.model';
import { DriverBooking } from 'src/app/core/models/booking.model';
import { DynamicFormContainerComponent } from 'src/app/shared/components/dynamic-form-container/dynamic-form-container.component';
import { ListAllDriversComponent } from 'src/app/shared/components/list-all-drivers/list-all-drivers.component';

@Component({
  selector: 'app-add-driver-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormContainerComponent,
  ],
  templateUrl: './add-driver-booking.component.html',
  styleUrls: ['./add-driver-booking.component.scss']
})
export class AddDriverBookingComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private formGeneratorService = inject(FormGeneratorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  bookingForm!: FormGroup;
  formConfig!: FormConfig;
  bookingId: string | null = null;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  drivers: any[] = [];

  ngOnInit() {
    this.loadFormConfig();
    this.getDrivers();

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: ParamMap) => {
        this.bookingId = params.get('id');
        if (this.bookingId) {
          this.isEditMode.set(true);
          this.loadBookingData(this.bookingId);
        }
      });
  }

  loadFormConfig() {
    this.utilityService.getJSON('assets/configs/driver-booking.json')
      .subscribe((data: FormConfig) => {
        this.formConfig = data;
        this.bookingForm = this.formGeneratorService.generateForm(this.formConfig);
        if (!this.isEditMode()) {
          this.initializeDateValues();
        }
        this.isLoading.set(false);
      });
  }

  loadBookingData(id: string) {
    this.firebaseService.getDocument('driver_bookings', id)
      .subscribe((data: any) => {
        if (data && this.bookingForm) {
          this.bookingForm.patchValue(data);
        }
      });
  }

  initializeDateValues() {
    if (!this.bookingForm) return;
    const now = new Date();
    const futureDate = new Date(now.getTime() + 15 * 60000); // Add 15 minutes

    // Format date as yyyy-mm-dd
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Format time as HH:mm (24h format for the time input)
    const hours = String(futureDate.getHours()).padStart(2, '0');
    const minutes = String(futureDate.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    this.bookingForm.patchValue({
      startDate: formattedDate,
      endDate: formattedDate,
      startTime: formattedTime,
      numberOfDays: 1
    });
  }

  getDrivers() {
    this.firebaseService.getRegisteredDrivers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((drivers) => {
        this.drivers = drivers || [];
      });
  }

  selectDriver() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';

    const dialogRef = this.dialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.drivers }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        if (result) {
          // 1. Auto-fill Form Fields
          this.bookingForm.patchValue({
            requiredDriver: result.driverName,
            rejectedDriver: 'NIL'
          });

          // 2. Dynamically Inject Driver ID as Subtext (Hint)
          if (this.formConfig && this.formConfig.formSectionConfig) {
            for (const section of this.formConfig.formSectionConfig) {
              const driverField = section.formFieldConfig.find(f => f.fieldID === 'requiredDriver');
              if (driverField) {
                driverField.hint = `ID: ${result.driverCode}`;
                break;
              }
            }
          }
        }
      });
  }

  onCancel() {
    this.bookingForm.reset();
    if (!this.isEditMode()) {
      this.initializeDateValues();
    } else {
      this.loadBookingData(this.bookingId!);
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const bookingData = this.bookingForm.value as DriverBooking;

      // Post-processing for time format as per business requirements
      if (bookingData.startTime) {
        bookingData.startTime = this.utilityService.convertTo12HourFormat(bookingData.startTime) || bookingData.startTime;
      }

      if (this.isEditMode()) {
        this.firebaseService.updateDocument('driver_bookings', this.bookingId!, bookingData)
          .then(() => {
            this.utilityService.successFailedPopup('SUCCESS');
            this.router.navigate(['/drivers/bookings']);
          })
          .catch(error => {
            console.error(error);
            this.utilityService.successFailedPopup('FAILED');
          });
      } else {
        const docId = this.firebaseService.createId();
        bookingData.docId = docId;
        bookingData.status = 'yts';

        this.firebaseService.addDocument('driver_bookings', bookingData)
          .then(() => {
            this.utilityService.successFailedPopup('SUCCESS');
            this.bookingForm.reset();
            this.initializeDateValues();
            this.router.navigate(['/drivers/bookings']);
          })
          .catch(error => {
            console.error(error);
            this.utilityService.successFailedPopup('FAILED');
          });
      }
    } else {
      this.bookingForm.markAllAsTouched();
    }
  }
}
