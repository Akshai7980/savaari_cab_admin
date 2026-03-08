import { Component, inject, OnInit, ViewChild, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ListAllDriversComponent } from '../../../shared/components/list-all-drivers/list-all-drivers.component';
import { SharedModule } from '../../../shared/shared.module';
import { Driver } from '../../../core/models/driver.model';
import { DriverLeave } from '../../../core/models/booking.model';

@Component({
  selector: 'apply-driver-leave',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './apply-driver-leave.component.html',
  styleUrls: ['./apply-driver-leave.component.scss']
})
export default class ApplyDriverLeaveComponent implements OnInit {
  @ViewChild('startDateInput') startDateInput!: any;
  @ViewChild('endDateInput') endDateInput!: any;

  public readonly applyLeaveForm: FormGroup;
  private allDrivers: Driver[] = [];
  private readonly currentDate: string = '';
  public editForm: boolean = false;

  private firebaseService = inject(FirebaseService);
  private formBuilder = inject(FormBuilder);
  private utilityService = inject(UtilityService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.currentDate = this.utilityService.currentDate();

    this.applyLeaveForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      leaveReason: [''],
      leaveStartDate: [this.currentDate, Validators.required],
      leaveEndDate: [this.currentDate, Validators.required],
      numberOfDays: ['1', Validators.required],
      leaveType: ['', Validators.required],
      driverMobileNumber: ['', Validators.required],
      docId: [''],
      createdAt: [new Date()],
      driverCode: [''],
      driverId: [''],
      driverType: [''],
      leaveAppliedBy: ['ADMIN']
    });
  }

  ngOnInit(): void {
    this.getAllDrivers();
  }

  onInputDate() {
    this.utilityService.updateDaysDifference(this.applyLeaveForm);
  }

  openDialog() {
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
      .subscribe((selectedDriver: Driver | null) => {
        if (selectedDriver) {
          this.applyLeaveForm.patchValue({
            driverName: selectedDriver.driverName,
            driverMobileNumber: selectedDriver.mobileNumber,
            driverCode: selectedDriver.driverCode,
            driverId: selectedDriver.docId,
            driverType: selectedDriver.driverType
          });
        }
      });
  }

  getAllDrivers() {
    this.firebaseService.getDriverList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.allDrivers = res;
        }
      });
  }

  settingValuesToForm() {
    this.applyLeaveForm.controls['leaveStartDate'].setValue(this.currentDate);
    this.applyLeaveForm.controls['leaveEndDate'].setValue(this.currentDate);
    this.applyLeaveForm.controls['numberOfDays'].setValue('1');
  }

  applyDriverLeave() {
    if (this.applyLeaveForm.valid && !this.editForm) {
      const docId = this.firebaseService.createId();

      this.applyLeaveForm.controls['docId'].setValue(docId);

      this.firebaseService
        .applyDriverLeave(this.applyLeaveForm.value)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.applyLeaveForm.reset();
          this.settingValuesToForm();
        })
        .catch((error) => {
          console.error('Error adding driver booking:', error);
          this.utilityService.successFailedPopup('FAILED');
          this.applyLeaveForm.reset();
          this.settingValuesToForm();
        });
    } else {
      this.firebaseService
        .updateLeaveStatus(this.applyLeaveForm.value)
        .then(() => {
          this.utilityService.successFailedPopup('SUCCESS');
          this.applyLeaveForm.reset();
          this.settingValuesToForm();
        })
        .catch((error) => {
          console.error('Error adding driver booking:', error);
          this.utilityService.successFailedPopup('FAILED');
          this.applyLeaveForm.reset();
          this.settingValuesToForm();
        });
    }
  }


}
