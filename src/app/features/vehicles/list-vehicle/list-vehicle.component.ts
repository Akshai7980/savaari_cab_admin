import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { TableConfig } from '../../../core/models/table-config.model';
import { Vehicle } from '../../../core/models/vehicle.model';
import { DynamicSummaryTableComponent } from '../../../shared/components/dynamic-summary-table/dynamic-summary-table.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ElementDetailedViewComponent } from '../../../shared/components/element-detailed-view/element-detailed-view.component';
import { AlertPopupComponent } from '../../../shared/components/alert-popup/alert-popup.component';

export interface VehicleDisplay extends Vehicle {
  position?: number;
}

@Component({
  selector: 'app-list-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    DynamicSummaryTableComponent,
    FormLoaderComponent
  ],
  templateUrl: './list-vehicle.component.html',
  styleUrls: ['./list-vehicle.component.scss'],
  providers: [TitleCasePipe]
})
export default class ListVehicleComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private snackBar = inject(SnackbarService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private titleCasePipe = inject(TitleCasePipe);

  tableConfig!: TableConfig;
  vehicleData: VehicleDisplay[] = [];
  isLoading = signal<boolean>(true);

  private dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this.loadTableConfig();
    this.getVehicleList();
  }

  loadTableConfig(): void {
    this.utilityService.getJSON('assets/configs/list-vehicle.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.tableConfig = data as TableConfig;
      });
  }

  getVehicleList(): void {
    this.firebaseService.getAllVehicleDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: Vehicle[]) => {
          this.vehicleData = res.map((item, index) => ({
            ...item,
            position: index + 1
          }));
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching vehicle details:', error);
          this.isLoading.set(false);
        }
      });
  }

  onTableAction(event: { actionID: string; row: VehicleDisplay }): void {
    switch (event.actionID) {
      case 'view':
        this.toViewVehicle(event.row);
        break;
      case 'delete':
        this.toDeleteVehicle(event.row);
        break;
      case 'edit':
        this.toEditVehicle(event.row);
        break;
    }
  }

  toViewVehicle(element: VehicleDisplay): void {
    this.dialog.closeAll();

    const data = [
      { key: 'Owner Name', value: this.titleCasePipe.transform(element.ownerName || '') },
      { key: 'Vehicle Number', value: element.vehicleNumber || '--' },
      { key: 'Registration Date', value: element.registrationDate || '--' },
      { key: 'Vehicle Age', value: element.vehicleAge?.toString() || '--' },
      { key: 'Insurance Date Start', value: element.insuranceDateStart || '--' },
      { key: 'Insurance Date End', value: element.insuranceDateEnd || '--' },
      { key: 'Fuel Type', value: this.titleCasePipe.transform(element.fuelType || '') || '--' },
      { key: 'Vehicle Class', value: this.titleCasePipe.transform(element.vehicleClass || '') || '--' },
      { key: 'Make Model', value: element.makeModel || '--' },
      { key: 'Smoke Clearance Date Start', value: element.smokeClearanceDateStart || '--' },
      { key: 'Smoke Clearance Date End', value: element.smokeClearanceDateEnd || '--' }
    ];

    this.dialogRef = this.dialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `Vehicle Detail (${element.vehicleNumber})`,
        buttons1: 'Edit',
        buttons2: 'Delete',
        edit: () => {
          this.dialogRef.close();
          this.toEditVehicle(element);
        },
        delete: () => {
          this.dialogRef.close();
          this.toDeleteVehicle(element);
        }
      }
    });
  }

  toDeleteVehicle(element: VehicleDisplay): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

    this.dialogRef = this.dialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: 'Delete Vehicle?',
        content: `Are you sure you want to delete vehicle <strong>${element.vehicleNumber || ''}</strong>? <br> This action cannot be undone.`,
        buttons: ['Go Back', 'Delete Vehicle'],
        onButtonClick: (e: string) => {
          if (e === 'Delete Vehicle' && element.docId) {
            this.dialogRef.close();
            this.firebaseService.deleteVehicle(element.docId).then(() => {
              this.snackBar.showMessage('Vehicle Details Successfully Deleted');
              this.getVehicleList();
            });
          } else {
            this.dialogRef.close();
          }
        }
      }
    });
  }

  toEditVehicle(element: VehicleDisplay): void {
    this.router.navigate(['editVehicle'], { queryParams: { id: element.docId } });
  }
}
