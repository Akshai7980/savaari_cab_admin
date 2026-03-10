import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { DataShareService } from '../../../core/services/data-share.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { FormGeneratorService } from '../../../core/services/form-generator.service';
import { FormConfig } from '../../../core/models/form-field.model';
import { DynamicFormContainerComponent } from '../../../shared/components/dynamic-form-container/dynamic-form-container.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormContainerComponent,
    FormLoaderComponent
  ],
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.scss']
})
export default class AddVehicleComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private dataSharingService = inject(DataShareService);
  private snackBar = inject(SnackbarService);
  private formGeneratorService = inject(FormGeneratorService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  vehicleRegForm!: FormGroup;
  formConfig!: FormConfig;
  isLoading = signal<boolean>(true);
  editForm = false;

  ngOnInit(): void {
    this.loadFormConfig();
  }

  loadFormConfig(): void {
    this.utilityService.getJSON('assets/configs/vehicle-registration.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.formConfig = data as FormConfig;
        this.vehicleRegForm = this.formGeneratorService.generateForm(this.formConfig);
        this.checkForEditMode();
        this.isLoading.set(false);
      });
  }

  private checkForEditMode(): void {
    this.dataSharingService.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          this.editForm = true;
          this.vehicleRegForm.patchValue(data);
        }
      });
  }

  onCancel(): void {
    this.vehicleRegForm.reset();
    this.editForm = false;
  }

  onSubmit(): void {
    if (this.vehicleRegForm.invalid) {
      this.vehicleRegForm.markAllAsTouched();
      return;
    }

    const vehicleData = this.vehicleRegForm.getRawValue();
    this.isLoading.set(true);

    if (!this.editForm) {
      const docId = this.firebaseService.createId();
      vehicleData.docId = docId;

      this.firebaseService.addVehicleDetails(vehicleData)
        .then(() => {
          this.snackBar.showMessage('Vehicle Details Successfully Added');
          this.vehicleRegForm.reset();
          this.router.navigate(['/listVehicle']);
        })
        .catch((error) => {
          console.error('Error adding vehicle details:', error);
          this.snackBar.showMessage('Error Adding vehicle details');
        })
        .finally(() => this.isLoading.set(false));
    } else {
      this.firebaseService.updateVehicleDetails(vehicleData)
        .then(() => {
          this.snackBar.showMessage('Vehicle Details Successfully Updated');
        })
        .catch((error) => {
          console.error('Error updating vehicle details:', error);
          this.snackBar.showMessage('Error Updating vehicle details');
        })
        .finally(() => this.isLoading.set(false));
    }
  }
}
