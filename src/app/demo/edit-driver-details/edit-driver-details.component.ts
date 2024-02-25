import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-edit-driver-details',
  templateUrl: './edit-driver-details.component.html',
  styleUrls: ['./edit-driver-details.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, SharedModule],
  standalone: true
})
export default class EditDriverDetailsComponent implements OnInit {
  driverRegForm: FormGroup;
  districts: District[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService
  ) {
    this.driverRegForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      address: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      altMobileNumber: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      pinCode: ['', Validators.required],
      driverType: ['', Validators.required],
      driverCode: ['', Validators.required],
      driverLocation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const rowData = JSON.parse(queryParams['rowData']);

    console.log(rowData);

    if (rowData.path === 'EDIT_DRIVER_BOOKING') {
      this.driverRegForm.controls['driverName'].setValue(rowData?.['rowData'].customerName);
      this.driverRegForm.controls['address'].setValue(rowData?.['rowData'].address);
      this.driverRegForm.controls['pickUpLocation'].setValue(rowData?.['rowData'].pickUpLocation);
      this.driverRegForm.controls['dropOffLocation'].setValue(rowData?.['rowData'].dropOffLocation);
      this.driverRegForm.controls['customerNumber'].setValue(rowData?.['rowData'].customerNumber);
      this.driverRegForm.controls['startDate'].setValue(rowData?.['rowData'].startDate);
      this.driverRegForm.controls['endDate'].setValue(rowData?.['rowData'].endDate);
      this.driverRegForm.controls['startTime'].setValue(rowData?.['rowData'].startTime);
      this.driverRegForm.controls['numberOfDays'].setValue(rowData?.['rowData'].numberOfDays);
      this.driverRegForm.controls['requiredDriver'].setValue(rowData?.['rowData'].requiredDriver);
      this.driverRegForm.controls['rejectedDriver'].setValue(rowData?.['rowData'].rejectedDriver);
      this.driverRegForm.controls['cusVehicleType'].setValue(rowData?.['rowData'].cusVehicleType);
      this.driverRegForm.controls['cusVehicleNumber'].setValue(rowData?.['rowData'].cusVehicleNumber);
      this.driverRegForm.controls['cusVehicleName'].setValue(rowData?.['rowData'].cusVehicleName);
    }

    this.fetchDistricts();

    if (!rowData) this.router.navigate(['/listDriverDetails']);
    return;
  }

  async fetchDistricts() {
    const response = await fetch('../../../assets/Json/districts.json');
    console.log(response);
    const distResp = await response.json();
    this.districts = distResp.districts;
    console.log(this.districts);
  }

  onInputDate() {
    this.utilityService.updateDaysDifference(this.driverRegForm);
  }

  addDriverBooking() {
    this.firebaseService
      .addDrivers(this.driverRegForm.value)
      .then((res) => {
        this.driverRegForm.reset();
        this.snackBar.showMessage('Driver Booking Successfully Added');
        console.log('Successfully added:', res);
      })
      .catch((error) => {
        this.snackBar.showMessage('Error Adding Driver Booking');
        console.error('Error adding driver booking:', error);
      });
  }
}

export interface Root {
  state: string;
  districts: District[];
}

export interface District {
  id: number;
  districts: string;
}
