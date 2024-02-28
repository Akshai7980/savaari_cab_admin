import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
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

  applyLeaveForm: FormGroup;
  allDrivers: Driver[];
  timeoutId: any;
  currentDate: string = '';
  editForm: boolean;
  private subscription: Subscription[];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog,
    private readonly router: ActivatedRoute
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
    const routerSubscription = this.router.queryParamMap.subscribe((params: any) => {
      const id = params.params['id'];
      if (id) {
        this.editForm = true;
        this.firebaseService.fetchVehicleDetails(id).then((data: any) => {
          this.applyLeaveForm.patchValue(data);
        });
      }
    });

    this.subscription.push(routerSubscription);

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
    if (this.applyLeaveForm.valid && !this.editForm) {
      console.log(this.applyLeaveForm.value);

      const docId = this.firebaseService.createId();
      this.applyLeaveForm.controls['docId'].setValue(docId);

      try {
        await this.firebaseService.applyDriverLeave(this.applyLeaveForm.value);
        this.applyLeaveForm.reset();

        this.timeoutId = setTimeout(() => {
          this.applyLeaveForm.controls['leaveStartDate'].setValue(this.currentDate);
          this.applyLeaveForm.controls['leaveEndDate'].setValue(this.currentDate);
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
    } else {
      try {
        await this.firebaseService.updateLeaveStatus(this.applyLeaveForm.value);
        this.applyLeaveForm.reset();

        this.timeoutId = setTimeout(() => {
          this.applyLeaveForm.controls['leaveStartDate'].setValue(this.currentDate);
          this.applyLeaveForm.controls['leaveEndDate'].setValue(this.currentDate);
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

    if (this.subscription)
      this.subscription.forEach((element) => {
        element.unsubscribe();
      });
  }
}
