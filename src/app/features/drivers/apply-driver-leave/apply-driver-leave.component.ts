import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { FormGeneratorService } from '../../../core/services/form-generator.service';
import { FormConfig, FormFieldConfig } from '../../../core/models/form-field.model';
import { DynamicFormContainerComponent } from '../../../shared/components/dynamic-form-container/dynamic-form-container.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ListAllDriversComponent } from '../../../shared/components/list-all-drivers/list-all-drivers.component';
import { Driver } from '../../../core/models/driver.model';

@Component({
  selector: 'apply-driver-leave',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormContainerComponent,
    FormLoaderComponent
  ],
  templateUrl: './apply-driver-leave.component.html',
  styleUrls: ['./apply-driver-leave.component.scss']
})
export default class ApplyDriverLeaveComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private formGeneratorService = inject(FormGeneratorService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  applyLeaveForm!: FormGroup;
  formConfig!: FormConfig;
  isLoading = signal<boolean>(true);
  editForm = false;

  private allDrivers: Driver[] = [];
  private selectedDriver: Driver | null = null;

  ngOnInit(): void {
    this.loadFormConfig();
    this.getAllDrivers();
  }

  loadFormConfig() {
    this.utilityService.getJSON('assets/configs/apply-driver-leave.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.formConfig = data as FormConfig;
        this.applyLeaveForm = this.formGeneratorService.generateForm(this.formConfig);
        this.isLoading.set(false);
      });
  }

  getAllDrivers() {
    this.firebaseService.getDriverList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((drivers) => {
        if (drivers && drivers.length > 0) {
          this.allDrivers = drivers;
        }
      });
  }

  selectDriver() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.allDrivers }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((driver: Driver | null) => {
        if (driver) {
          this.selectedDriver = driver;
          this.applyLeaveForm.patchValue({
            driverName: driver.driverName,
            driverMobileNumber: driver.mobileNumber
          });

          // Update the hint on the driverName field with the driver code
          if (this.formConfig && this.formConfig.formSectionConfig) {
            for (const section of this.formConfig.formSectionConfig) {
              const driverField = section.formFieldConfig.find(f => f.fieldID === 'driverName');
              if (driverField) {
                driverField.hint = `ID: ${driver.driverCode}`;
                break;
              }
            }
          }
        }
      });
  }

  onFieldClick(event: { fieldID: string; config: FormFieldConfig }) {
    if (event.fieldID === 'driverName') {
      this.selectDriver();
    }
  }

  onCancel() {
    this.applyLeaveForm.reset();
  }

  onSubmit() {
    if (this.applyLeaveForm.invalid) {
      this.applyLeaveForm.markAllAsTouched();
      return;
    }

    const leaveData = { ...this.applyLeaveForm.value };
    leaveData.createdAt = new Date();
    leaveData.leaveAppliedBy = 'ADMIN';

    // Include selected driver metadata in payload
    if (this.selectedDriver) {
      leaveData.driverCode = this.selectedDriver.driverCode;
      leaveData.driverId = this.selectedDriver.docId;
      leaveData.driverType = this.selectedDriver.driverType;
    }

    console.log('Final Form Data Object:', leaveData);

    this.isLoading.set(true);

    if (this.editForm) {
      this.firebaseService.updateLeaveStatus(leaveData)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.applyLeaveForm.reset();
        })
        .catch((error) => {
          console.error('Error updating leave:', error);
          this.utilityService.successFailedPopup('FAILED');
        })
        .finally(() => this.isLoading.set(false));
    } else {
      const docId = this.firebaseService.createId();
      leaveData.docId = docId;

      this.firebaseService.applyDriverLeave(leaveData)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.applyLeaveForm.reset();
        })
        .catch((error) => {
          console.error('Error applying leave:', error);
          this.utilityService.successFailedPopup('FAILED');
        })
        .finally(() => this.isLoading.set(false));
    }
  }
}
