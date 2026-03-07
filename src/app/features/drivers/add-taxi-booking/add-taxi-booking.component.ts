import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Driver } from 'src/app/core/models/driver.model';

interface District {
  id: number;
  districts: string;
}

interface BloodType {
  bloodType: string;
  Rh: string;
}

@Component({
  selector: 'app-add-taxi-booking',
  templateUrl: './add-taxi-booking.component.html',
  styleUrls: ['./add-taxi-booking.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule]
})
export default class AddTaxiBookingComponent implements AfterViewInit, OnInit {
  driverRegForm: FormGroup;

  // Using Signals for reactive state
  districts = signal<District[]>([]);
  bloodGroups = signal<BloodType[]>([]);

  assetsPath: string = '../../../assets/Json/';
  private destroyRef = inject(DestroyRef);

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

  fetchDistricts(): void {
    this.utilityService.getData(this.assetsPath + 'districts.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.districts.set(response as District[]);
        }
      });
  }

  fetchBloodGroups(): void {
    this.utilityService.getData(this.assetsPath + 'bloodGroup.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response) {
          this.bloodGroups.set(response as BloodType[]);
        }
      });
  }

  onLicenseKeyUp(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.utilityService.formatLicensePlate(input.value);
  }

  ngAfterViewInit(): void {
    this.utilityService
      .generateToken()
      .then((token) => {
        this.driverRegForm.controls['driverCode'].setValue(token);
      })
      .catch((error) => {
        console.error('Error generating token:', error);
      });
  }

  async addDriverBooking(): Promise<void> {
    const docId = this.firebaseService.createId();
    this.driverRegForm.controls['docId'].setValue(docId);

    const driverData = this.driverRegForm.value as Driver;

    try {
      await this.firebaseService.addDrivers(driverData);
      this.driverRegForm.reset();
      this.snackBar.showMessage('Driver Booking Successfully Added');
    } catch (error) {
      this.snackBar.showMessage('Error Adding Driver Booking');
      console.error('Error adding driver booking:', error);
    }
  }
}
