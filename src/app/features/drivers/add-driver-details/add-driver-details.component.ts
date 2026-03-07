import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutocapitalizeDirective } from 'src/app/shared/directives/autocapitalize.directive';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-add-driver-details',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, AutocapitalizeDirective],
  templateUrl: './add-driver-details.component.html',
  styleUrls: ['./add-driver-details.component.scss']
})
export default class AddDriverDetailsComponent implements AfterViewInit, OnInit {
  driverRegForm: FormGroup;

  districts: District[] = [];
  bloodGroups: BloodType[] = [];
  driverGrades: Grade[] = [];

  assetsPath: string = '../../../assets/Json/';

  constructor(
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly formBuilder: FormBuilder
  ) {
    this.driverRegForm = this.formBuilder.group({
      driverName: ['', Validators.required],
      driverLocation: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      altMobileNumber: [''],
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
    this.fetchDriverGrades();
  }

  fetchDistricts() {
    this.utilityService.getData(this.assetsPath + 'districts.json').subscribe((response: District[]) => {
      if (response) {
        this.districts = response;
      }
    });
  }

  fetchBloodGroups() {
    this.utilityService.getData(this.assetsPath + 'bloodGroup.json').subscribe((response: BloodType[]) => {
      if (response) {
        this.bloodGroups = response;
      }
    });
  }

  fetchDriverGrades() {
    this.utilityService.getData(this.assetsPath + 'driverGrade.json').subscribe((response: Grade[]) => {
      if (response) {
        this.driverGrades = response;
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
      .then(() => {
        this.utilityService.successFailedPopup('SUCCESS');
        this.driverRegForm.reset();
      })
      .catch((error) => {
        this.utilityService.successFailedPopup('FAILED');
        console.error('Error adding driver booking:', error);
      });
  }
}

interface District {
  id: number;
  districts: string;
}

interface BloodType {
  bloodType: string;
  Rh: string;
}

interface Grade {
  id: string;
  grade: string;
}
