import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-add-taxi-booking',
  templateUrl: './add-taxi-booking.component.html',
  styleUrls: ['./add-taxi-booking.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule]
})
export default class AddTaxiBookingComponent implements AfterViewInit, OnInit {
  driverRegForm: FormGroup;
  districts: any;
  bloodGroups: any;
  assetsPath: string = '../../../assets/Json/';

  constructor(
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder
  ) {
    this.driverRegForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      driverLocation: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      altMobileNumber: ['', Validators.required],
      address: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      state: ['Kerala', Validators.required],
      district: ['', Validators.required],
      pinCode: ['', Validators.required],
      driverGrade: ['', Validators.required],
      driverCode: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      dateOfResigning: [''],
      docId: ['']
    });
  }

  ngOnInit(): void {
    this.fetchDistricts();
    this.fetchBloodGroups();
  }

  fetchDistricts() {
    this.utilityService.getData(this.assetsPath + 'districts.json').subscribe((response: District) => {
      if (response) {
        this.districts = response;
      }
    });
  }

  fetchBloodGroups() {
    this.utilityService.getData(this.assetsPath + 'bloodGroup.json').subscribe((response: BloodType) => {
      if (response) {
        this.bloodGroups = response;
      }
    });
  }

  onLicenseKeyUp(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    input.value = this.utilityService.formatLicensePlate(input.value);
  }

  ngAfterViewInit(): void {
    this.utilityService
      .generateToken()
      .then((token) => {
        this.driverRegForm.controls['driverCode'].setValue(token);
        console.log('token:', token);
      })
      .catch((error) => {
        console.error('Error generating token:', error);
      });
  }

  async addDriverBooking() {
    const docId = this.firebaseService.createId();
    this.driverRegForm.controls['docId'].setValue(docId);

    this.firebaseService
      .addDrivers(this.driverRegForm.value)
      .then(async (res) => {
        this.driverRegForm.reset();
        await this.snackBar.showMessage('Driver Booking Successfully Added');
        console.log('Successfully added:', res);
      })
      .catch((error) => {
        this.snackBar.showMessage('Error Adding Driver Booking');
        console.error('Error adding driver booking:', error);
      });
  }
}

interface District {
  id: number;
  name: string;
}

interface BloodType {
  bloodType: string;
  Rh: string;
}
