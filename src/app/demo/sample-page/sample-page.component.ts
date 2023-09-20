import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
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
export default class SamplePageComponent implements AfterViewInit {
  driverRegForm: FormGroup;

  constructor(
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder
  ) {
    this.driverRegForm = this.formBuilder.group({
      customer_name: ['', Validators.required],
      address: ['', Validators.required],
      pickUpLocation: ['', Validators.required],
      dropOffLocation: ['', Validators.required],
      customer_number: ['', Validators.required],
      bookingDate: ['', Validators.required],
      endDate: ['', Validators.required],
      timePicker: ['', Validators.required],
      numberOfDays: ['', Validators.required],
      tripClosedDrierName: ['', Validators.required],
      vehicleType: ['', Validators.required],
      tripClosedDrierMobile: ['', Validators.required]
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const token = await this.utilityService.generateToken();
    console.log('token:', token);
  }

  addDriverBooking() {
    this.firebaseService
      .addDriverBooking(this.driverRegForm.value)
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
