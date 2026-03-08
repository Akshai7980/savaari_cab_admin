import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { FormGeneratorService } from '../../../core/services/form-generator.service';
import { FormConfig, FormFieldConfig } from '../../../core/models/form-field.model';
import { DriverBooking } from '../../../core/models/booking.model';
import { DynamicFormContainerComponent } from '../../../shared/components/dynamic-form-container/dynamic-form-container.component';
import { ListAllDriversComponent } from '../../../shared/components/list-all-drivers/list-all-drivers.component';
import { Driver } from '../../../core/models/driver.model';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';

@Component({
  selector: 'app-add-driver-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormContainerComponent,
    FormLoaderComponent,
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
  drivers: Driver[] = [];

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.formConfig = data as FormConfig;
        this.bookingForm = this.formGeneratorService.generateForm(this.formConfig);
        this.isLoading.set(false);
      });
  }

  loadBookingData(id: string) {
    this.firebaseService.getDocument<DriverBooking>('driver_bookings', id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data && this.bookingForm) {
          this.bookingForm.patchValue(data);
        }
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
      .subscribe((result: Driver | null) => {
        if (result) {
          this.bookingForm.patchValue({
            requiredDriver: result.driverName,
            rejectedDriver: 'NIL'
          });

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

  onFieldClick(event: { fieldID: string; config: FormFieldConfig }) {
    if (event.fieldID === 'requiredDriver') {
      this.selectDriver();
    }
  }

  onCancel() {
    this.bookingForm.reset();
    if (this.isEditMode()) {
      this.loadBookingData(this.bookingId!);
    }
  }

  onSubmit() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const bookingData = { ...this.bookingForm.value } as any;
    console.log('Final Form Data Object:', bookingData);

    this.isLoading.set(true);

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
        })
        .finally(() => this.isLoading.set(false));
    } else {
      const docId = this.firebaseService.createId();
      bookingData.docId = docId;
      bookingData.status = 'yts';

      this.firebaseService.addDocument('driver_bookings', bookingData)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.bookingForm.reset();
          this.router.navigate(['/drivers/bookings']);
        })
        .catch(error => {
          console.error(error);
          this.utilityService.successFailedPopup('FAILED');
        })
        .finally(() => this.isLoading.set(false));
    }
  }
}
