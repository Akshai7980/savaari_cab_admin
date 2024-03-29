import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ElementDetailedViewComponent } from 'src/app/theme/shared/components/element-detailed-view/element-detailed-view.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-list-vehicle',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './list-vehicle.component.html',
  styleUrls: ['./list-vehicle.component.scss']
})
export default class ListVehicleComponent implements OnInit {
  displayedColumns: string[] = ['position', 'ownerName', 'vehicleNumber', 'fuelType', 'vehicleAge', 'vehicleClass', 'actions'];
  dataSource = new MatTableDataSource<VehicleList>([]);
  showPaginator: boolean = false;
  dialogRef;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly matDialog: MatDialog,
    private readonly router: Router,
    private readonly snackBar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.getVehicleList();
  }

  getVehicleList() {
    this.firebaseService.getAllVehicleDetails().subscribe(
      (res: VehicleList[]) => {
        console.log(res);
        let position = 1;

        res.forEach((element) => {
          element.position = position++;
        });

        this.dataSource.data = res;
        if (this.dataSource.data.length > 5) this.showPaginator = true;
        else this.showPaginator = false;
      },
      (error) => {
        console.error('Error fetching driver bookings:', error);
      }
    );
  }

  toViewVehicle(element) {
    this.matDialog.closeAll();

    const data = [
      { key: 'Owner Name', value: element.ownerName },
      { key: 'Vehicle Number', value: element.vehicleNumber },
      { key: 'Registration Date', value: element.registrationDate },
      { key: 'Vehicle Age', value: element.vehicleAge },
      { key: 'Insurance Date Start', value: element.insuranceDateStart },
      { key: 'Insurance Date End', value: element.insuranceDateEnd },
      { key: 'Fuel Type', value: element.fuelType },
      { key: 'Vehicle Class', value: element.vehicleClass },
      { key: 'Make Model', value: element.makeModel },
      { key: 'SmokeClearance Date Start', value: element.smokeClearanceDateStart },
      { key: 'Smoke Clearance DateEnd', value: element.smokeClearanceDateEnd }
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

  toDeleteVehicle(element) {
    this.firebaseService.deleteVehicle(element.docId).then(() => {
      this.snackBar.showMessage('Vehicle Details Successfully Deleted');
      this.getVehicleList();
    });
  }

  toEditVehicle(element) {
    this.router.navigate(['editVehicle'], { queryParams: { id: element.docId } });
  }
}

export interface VehicleList {
  position: number;
  ownerName: string;
  vehicleNumber: string;
  fuelType: string;
  vehicleAge: number;
  vehicleClass: string;
}
