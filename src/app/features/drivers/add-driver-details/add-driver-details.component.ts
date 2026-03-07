import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FormGeneratorService } from 'src/app/core/services/form-generator.service';
import { FormConfig } from 'src/app/core/models/form-field.model';
import { DynamicFormContainerComponent } from 'src/app/shared/components/dynamic-form-container/dynamic-form-container.component';
import { FormLoaderComponent } from 'src/app/shared/components/form-loader/form-loader.component';

@Component({
  selector: 'app-add-driver-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormContainerComponent,
    FormLoaderComponent
  ],
  templateUrl: './add-driver-details.component.html',
  styleUrls: ['./add-driver-details.component.scss']
})
export default class AddDriverDetailsComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private formGeneratorService = inject(FormGeneratorService);
  private router = inject(Router);

  driverRegForm!: FormGroup;
  formConfig!: FormConfig;
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadFormConfig();
  }

  loadFormConfig() {
    this.utilityService.getJSON('assets/configs/driver-registration.json')
      .subscribe((data: FormConfig) => {
        this.formConfig = data;
        this.driverRegForm = this.formGeneratorService.generateForm(this.formConfig);
        this.generateDriverToken();
        // Artificial delay for smooth Premium UX loader transition
        setTimeout(() => {
          this.isLoading.set(false);
        }, 600);
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

  async onSubmit() {
    if (this.driverRegForm.valid) {
      const driverData = this.driverRegForm.getRawValue(); // include disabled field values like driverCode

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
          this.utilityService.successFailedPopup('FAILED');
          console.error('Error adding driver details:', error);
        });
    } else {
      this.driverRegForm.markAllAsTouched();
    }
  }
}
