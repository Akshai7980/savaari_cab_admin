import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataShareService } from 'src/app/services/data-share.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.scss']
})
export default class AddVehicleComponent implements OnInit {
  vehicleRegForm: FormGroup;
  fuelType;
  editForm: boolean = false;
  private subscription: Subscription[] = [];

  constructor(
    private readonly utilityService: UtilityService,
    private readonly firebaseService: FirebaseService,
    private readonly dataSharingService: DataShareService,
    private readonly snackBar: SnackbarService,
    private readonly formBuilder: FormBuilder,
    private readonly router: ActivatedRoute
  ) {
    this.vehicleRegForm = this.formBuilder.group({
      ownerName: [''],
      vehicleNumber: ['', Validators.required],
      insuranceDateStart: ['', Validators.required],
      insuranceDateEnd: ['', Validators.required],
      registrationDate: ['', Validators.required],
      registeringAuthority: ['Kerala'],
      makeModel: ['', Validators.required],
      fuelType: ['', Validators.required],
      vehicleAge: ['', Validators.required],
      vehicleClass: ['', Validators.required],
      smokeClearanceDateStart: ['', Validators.required],
      smokeClearanceDateEnd: ['', Validators.required],
      docId: ['']
    });
  }

  ngOnInit(): void {
    const subscription = this.dataSharingService.data$.subscribe((data) => {
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        this.editForm = true;
        this.vehicleRegForm.patchValue(data);
      }
    });

    this.subscription.push(subscription);

    this.fetchFuelType();
  }

  ngAfterViewInit(): void {
    this.vehicleRegForm.controls['registeringAuthority'].disable();
    const subscription = this.vehicleRegForm.controls['registrationDate'].valueChanges.subscribe((value) => {
      var dayDifference = this.utilityService.calculateDaysDifference(value, new Date().toISOString());
      this.vehicleRegForm.controls['vehicleAge'].setValue(dayDifference);
    });

    this.subscription.push(subscription);
  }

  async fetchFuelType() {
    const response = await fetch('../../../../assets/Json/fuelType.json');
    const data = await response.json();
    this.fuelType = data.fuelType;
  }

  addVehicle() {
    if (this.vehicleRegForm.valid) {
      if (!this.editForm) {
        const docId = this.firebaseService.createId();
        this.vehicleRegForm.controls['docId'].setValue(docId);

        this.firebaseService.addVehicleDetails(this.vehicleRegForm.value).then(
          (res) => {
            console.log(res);
            this.vehicleRegForm.reset();
            this.snackBar.showMessage('Vehicle Details Successfully Added');
          },
          (error) => {
            console.error('Error adding vehicle details:', error);
            this.snackBar.showMessage('Error Adding vehicle details');
          }
        );
      } else {
        this.firebaseService.updateVehicleDetails(this.vehicleRegForm.value).then(
          (res) => {
            this.snackBar.showMessage('Vehicle Details Successfully Updated');
          },
          (error) => {
            console.error('Error updating vehicle details:', error);
            this.snackBar.showMessage('Error Updating vehicle details');
          }
        );
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.forEach((element) => {
        element.unsubscribe();
      });
  }
}
