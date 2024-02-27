import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataShareService } from 'src/app/services/data-share.service';
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
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly dataSharingService: DataShareService
  ) {
    this.driverRegForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      address: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      altMobileNumber: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      district: ['', Validators.required],
      driverType: ['', Validators.required],
      driverCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchDistricts();

    this.dataSharingService.data$.subscribe((data) => {
      console.log('data:', data);

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        const driverDetails = data;

        this.driverRegForm.controls['address'].setValue(driverDetails.address);

        this.driverRegForm.controls['altMobileNumber'].setValue(driverDetails.alternateNumber);

        this.driverRegForm.controls['mobileNumber'].setValue(driverDetails.mobileNumber);
        this.driverRegForm.controls['bloodGroup'].setValue(driverDetails.bloodGroup);
        this.driverRegForm.controls['licenseNumber'].setValue(driverDetails.licenseNumber);
        this.driverRegForm.controls['driverName'].setValue(driverDetails.fullName);
        this.driverRegForm.controls['district'].setValue(driverDetails.district);

        this.driverRegForm.controls['driverType'].setValue(
          driverDetails.driverType === 'callDriver' ? 'Call Driver' : driverDetails.driverType === 'taxiDriver' ? 'Taxi Driver' : ''
        );

        this.driverRegForm.controls['driverCode'].setValue(driverDetails.driverCode);
      } else {
        console.warn('Received invalid data from data stream');
      }

      if (data.length === 0) this.router.navigate(['/listDriverDetails']);
      return;
    });
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
