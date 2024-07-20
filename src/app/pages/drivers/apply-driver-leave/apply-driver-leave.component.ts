import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataShareService } from 'src/app/services/data-share.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ListAllDriversComponent } from 'src/app/theme/shared/components/list-all-drivers/list-all-drivers.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Driver } from '../add-driver-booking/add-driver-booking.component';

@Component({
  selector: 'apply-driver-leave',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './apply-driver-leave.component.html',
  styleUrls: ['./apply-driver-leave.component.scss']
})
export default class ApplyDriverLeaveComponent implements OnInit, OnDestroy {
  @ViewChild('startDateInput') startDateInput: HTMLInputElement;
  @ViewChild('endDateInput') endDateInput: HTMLInputElement;

  public readonly applyLeaveForm: FormGroup;
  private allDrivers: Driver[];
  private readonly currentDate: string = '';
  public editForm: boolean = false;
  private readonly subscription: Subscription[] = [];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly dataSharingService: DataShareService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) {
    this.currentDate = utilityService.currentDate();

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
    const subscription = this.dataSharingService.data$.subscribe((data) => {
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        this.applyLeaveForm.patchValue(data);
        this.editForm = true;
      }
    });

    this.subscription.push(subscription);

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

    const subscription = dialogRef.afterClosed().subscribe((selectedDrivers: Driver[]) => {
      console.log(`Dialog result:`, selectedDrivers);

      this.applyLeaveForm.controls['driverName'].setValue(selectedDrivers['type']); // yet to update
      this.applyLeaveForm.controls['driverMobileNumber'].setValue(selectedDrivers['otp']); // yet to update
      this.applyLeaveForm.controls['driverCode'].setValue(''); // yet to update
      this.applyLeaveForm.controls['driverId'].setValue(''); // yet to update
      this.applyLeaveForm.controls['driverType'].setValue(''); // yet to update
    });

    this.subscription.push(subscription);
  }

  getAllDrivers() {
    const subscription = this.firebaseService.getUserOTPs().subscribe((res) => {
      if (res && res.length > 0) {
        this.allDrivers = res;
      }
    });

    this.subscription.push(subscription);
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

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.forEach((element) => {
        element.unsubscribe();
      });
  }
}
