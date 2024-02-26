import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DataShareService } from 'src/app/services/data-share.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-list-driver-details',
  standalone: true,
  templateUrl: './list-driver-details.component.html',
  styleUrls: ['./list-driver-details.component.scss'],
  imports: [CommonModule, SharedModule]
})
export default class ListDriverDetailsComponent {
  displayedColumns: string[] = ['position', 'driverName', 'mobileNumber', 'driverType', 'district', 'actions'];
  dataSource = new MatTableDataSource<ListAllDrivers>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showPaginator: boolean = false;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router,
    private readonly dataSharingService: DataShareService
  ) {}

  ngOnInit(): void {
    this.getDriverList();
  }

  ngAfterViewChecked() {
    if (this.showPaginator && !this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.showPaginator && this.dataSource.paginator) {
      this.dataSource.paginator = null;
    }
  }

  getDriverList() {
    this.firebaseService.getDriverList().subscribe(
      (res: ListAllDrivers[]) => {
        console.log(res);

        const response = [];
        let position = 1;

        res.forEach((element) => {
          element.position = position++;
          response.push(element);
        });

        this.dataSource.data = response;
        if (this.dataSource.data.length > 5) this.showPaginator = true;
        else this.showPaginator = false;
      },
      (error) => {
        console.error('Error fetching driver bookings:', error);
      }
    );
  }

  toViewDriverDetails(rowData: ListAllDrivers) {
    console.log(rowData);
  }

  toDeleteDriverDetails(rowData: ListAllDrivers) {
    console.log(rowData);

    const params = {
      isLeaveCancelled: true,
      leaveCancelledAt: new Date(),
      cancelledBy: 'ADMIN',
      docId: rowData.id
    };
    this.firebaseService.updateLeaveStatus(params);
  }

  toEditDriverDetails(rowData: ListAllDrivers) {
    console.log(rowData);
    rowData.path = 'EDIT_DRIVER_DETAILS';
    this.dataSharingService.updateData(rowData);
    this.router.navigate(['/editDriverDetails']);
  }
}

export interface ListAllDrivers {
  path: string;
  position: number;
  driverName: string;
  mobileNumber: number;
  driverType: string;
  district: string;
  fullName: string;
  id: string;
}
