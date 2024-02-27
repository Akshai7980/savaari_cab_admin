import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export default class SamplePageComponent implements AfterViewInit, OnInit {
  driverRegForm: FormGroup;
  districts: any;

  constructor(
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder
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
    this.driverRegForm.controls['state'].setValue('Kerala');
    this.fetchDistricts();
  }

  async fetchDistricts() {
    const response = await fetch('../../../assets/Json/districts.json');
    console.log(response);
    const distResp = await response.json();
    this.districts = distResp.districts;
    console.log(this.districts);
  }

  async ngAfterViewInit(): Promise<void> {
    const token = await this.utilityService.generateToken();
    this.driverRegForm.controls['driverCode'].setValue(token);
    console.log('token:', token);
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
