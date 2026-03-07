import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { ElementDetailedViewComponent } from 'src/app/shared/components/element-detailed-view/element-detailed-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Vehicle } from 'src/app/core/models/vehicle.model';

export interface VehicleDisplay extends Vehicle {
  position?: number;
}

@Component({
  selector: 'app-list-vehicle',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './list-vehicle.component.html',
  styleUrls: ['./list-vehicle.component.scss']
})
export default class ListVehicleComponent implements OnInit {
  displayedColumns: string[] = ['position', 'ownerName', 'vehicleNumber', 'fuelType', 'vehicleAge', 'vehicleClass', 'actions'];
  dataSource = new MatTableDataSource<VehicleDisplay>([]);
  showPaginator = false;
  private dialogRef: any;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly matDialog: MatDialog,
    private readonly router: Router,
    private readonly snackBar: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getVehicleList();
  }

  getVehicleList(): void {
    this.firebaseService.getAllVehicleDetails().subscribe(
      (res: Vehicle[]) => {
        const mappedData: VehicleDisplay[] = res.map((item, index) => ({
          ...item,
          position: index + 1
        }));

        this.dataSource.data = mappedData;
        this.showPaginator = mappedData.length > 5;
      },
      (error) => {
        console.error('Error fetching vehicle details:', error);
      }
    );
  }

  toViewVehicle(element: VehicleDisplay): void {
    this.matDialog.closeAll();

    const data = [
      { key: 'Owner Name', value: element.ownerName },
      { key: 'Vehicle Number', value: element.vehicleNumber },
      { key: 'Registration Date', value: element.registrationDate || '' },
      { key: 'Vehicle Age', value: element.vehicleAge || '' },
      { key: 'Insurance Date Start', value: element.insuranceDateStart || '' },
      { key: 'Insurance Date End', value: element.insuranceDateEnd || '' },
      { key: 'Fuel Type', value: element.fuelType || '' },
      { key: 'Vehicle Class', value: element.vehicleClass || '' },
      { key: 'Make Model', value: element.makeModel || '' },
      { key: 'SmokeClearance Date Start', value: element.smokeClearanceDateStart || '' },
      { key: 'Smoke Clearance DateEnd', value: element.smokeClearanceDateEnd || '' }
    ];

    this.dialogRef = this.matDialog.open(ElementDetailedViewComponent, {
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
    if (element.docId) {
      this.firebaseService.deleteVehicle(element.docId).then(() => {
        this.snackBar.showMessage('Vehicle Details Successfully Deleted');
        this.getVehicleList();
      });
    }
  }

  toEditVehicle(element: VehicleDisplay): void {
    this.router.navigate(['editVehicle'], { queryParams: { id: element.docId } });
  }
}
