import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { FormGeneratorService } from '../../../core/services/form-generator.service';
import { FormConfig } from '../../../core/models/form-field.model';
import { DynamicFormContainerComponent } from '../../../shared/components/dynamic-form-container/dynamic-form-container.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';

@Component({
  selector: 'app-add-taxi-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormContainerComponent,
    FormLoaderComponent
  ],
  templateUrl: './add-taxi-booking.component.html',
  styleUrls: ['./add-taxi-booking.component.scss']
})
export default class AddTaxiBookingComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private formGeneratorService = inject(FormGeneratorService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  driverRegForm!: FormGroup;
  formConfig!: FormConfig;
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadFormConfig();
  }

  loadFormConfig() {
    this.utilityService.getJSON('assets/configs/driver-registration.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.formConfig = data as FormConfig;
        this.driverRegForm = this.formGeneratorService.generateForm(this.formConfig);
        this.generateDriverToken();
        this.isLoading.set(false);
      });
  }

  generateDriverToken() {
    this.utilityService.generateToken()
      .then((token) => {
        if (this.driverRegForm) {
          this.driverRegForm.patchValue({ driverCode: token });
        }
      })
      .catch((error) => {
        console.error('Error generating token:', error);
      });
  }

  onCancel() {
    this.driverRegForm.reset();
    this.generateDriverToken();
  }

  onSubmit() {
    if (this.driverRegForm.invalid) {
      this.driverRegForm.markAllAsTouched();
      return;
    }

    const driverData = this.driverRegForm.getRawValue();
    console.log('Final Form Data Object:', driverData);

    this.isLoading.set(true);

    const docId = this.firebaseService.createId();
    driverData.docId = docId;

    this.firebaseService.addDrivers(driverData)
      .then(() => {
        this.utilityService.successFailedPopup('SUCCESS');
        this.driverRegForm.reset();
        this.generateDriverToken();
        this.router.navigate(['/drivers/list-driver-details']);
      })
      .catch((error) => {
        console.error('Error adding driver details:', error);
        this.utilityService.successFailedPopup('FAILED');
      })
      .finally(() => this.isLoading.set(false));
  }
}
