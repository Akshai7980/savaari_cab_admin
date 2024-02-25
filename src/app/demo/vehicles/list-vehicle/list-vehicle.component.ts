import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-list-vehicle',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './list-vehicle.component.html',
  styleUrls: ['./list-vehicle.component.scss']
})
export default class ListVehicleComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['position', 'ownerName', 'vehicleNumber', 'fuelType', 'vehicleAge', 'vehicleClass', 'actions'];
  dataSource = new MatTableDataSource<VehicleList>([]);
  showPaginator: boolean = false;

  constructor(
    private readonly firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.getVehicleList();
  }

  ngAfterViewInit(): void {
    
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
    console.log(element);
  }

  toCancelVehicle(element) {
    console.log(element)
  }

  toEditVehicle(element) {
    console.log(element)
  }
}

export interface VehicleList {
  position: number,
  ownerName: string,
  vehicleNumber: string,
  fuelType: string,
  vehicleAge: number,
  vehicleClass: string
}