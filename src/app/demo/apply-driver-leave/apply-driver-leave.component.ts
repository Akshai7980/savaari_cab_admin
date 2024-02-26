import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ListAllDriversComponent } from 'src/app/modals/list-all-drivers/list-all-drivers.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Driver } from '../elements/typography/typography.component';

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

  applyLeaveForm: FormGroup;
  allDrivers: Driver[];
  timeoutId: any;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) {
    this.applyLeaveForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      leaveReason: [''],
      leaveStartDate: ['', Validators.required],
      leaveEndDate: ['', Validators.required],
      numberOfDays: ['', Validators.required],
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

    this.applyLeaveForm.controls['leaveStartDate'].setValue(this.utilityService.currentDate());
    this.applyLeaveForm.controls['leaveEndDate'].setValue(this.utilityService.currentDate());

    this.applyLeaveForm.controls['numberOfDays'].setValue('1');
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

    dialogRef.afterClosed().subscribe((selectedDrivers: Driver[]) => {
      console.log(`Dialog result:`, selectedDrivers);

      this.applyLeaveForm.controls['driverName'].setValue(selectedDrivers['type']); // yet to update
      this.applyLeaveForm.controls['driverMobileNumber'].setValue(selectedDrivers['otp']); // yet to update
      this.applyLeaveForm.controls['driverCode'].setValue(''); // yet to update
      this.applyLeaveForm.controls['driverId'].setValue(''); // yet to update
      this.applyLeaveForm.controls['driverType'].setValue(''); // yet to update
    });
  }

  getAllDrivers() {
    this.firebaseService.getUserOTPs().subscribe((res: any) => {
      if (res && res.length > 0) {
        this.allDrivers = res;
      }
    });
  }

  async applyDriverLeave() {
    if (this.applyLeaveForm.valid) {
      console.log(this.applyLeaveForm.value);

      const docId = this.firebaseService.createId();
      this.applyLeaveForm.controls['docId'].setValue(docId);

      try {
        const res = await this.firebaseService.applyDriverLeave(this.applyLeaveForm.value);
        console.log(res);
        this.applyLeaveForm.reset();

        this.timeoutId = setTimeout(() => {
          this.applyLeaveForm.controls['leaveStartDate'].setValue(this.utilityService.currentDate());
          this.applyLeaveForm.controls['leaveEndDate'].setValue(this.utilityService.currentDate());
          this.applyLeaveForm.controls['numberOfDays'].setValue('1');
        }, 100);

        // Need to check the issue for snackBar here
        this.timeoutId = setTimeout(() => {
          this.snackBar.showMessage('Driver Leave Successfully Added');
        }, 2000);
      } catch (error) {
        console.error('Error adding driver leave:', error);
        this.snackBar.showMessage('Error Adding Driver leave');
      }
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
