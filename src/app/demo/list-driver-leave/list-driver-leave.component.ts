import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'list-driver-leave',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './list-driver-leave.component.html',
  styleUrls: ['./list-driver-leave.component.scss']
})
export default class ListDriverLeaveComponent implements OnInit, AfterViewChecked {
  displayedColumns: string[] = ['position', 'driverName', 'driverMobileNumber', 'leaveReason', 'leaveType', 'numberOfDays', 'actions'];
  dataSource = new MatTableDataSource<AppliedLeaves>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showPaginator: boolean = false;

  constructor(private readonly firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.getDriverAppliedLeaves();
  }

  ngAfterViewChecked() {
    if (this.showPaginator && !this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.showPaginator && this.dataSource.paginator) {
      this.dataSource.paginator = null;
    }
  }

  getDriverAppliedLeaves() {
    this.firebaseService.getDriverAppliedLeaves().subscribe(
      (res: AppliedLeaves[]) => {
        console.log(res);
        const response = [];
        let position = 1;

        res.forEach((element) => {
          if (!element.isLeaveCancelled) {
            element.position = position++;
            element.isLeaveCancelled = false;
          }

          if (!element.isLeaveCancelled) response.push(element);
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

  toViewLeave(rowData: any) {
    console.log(rowData);
  }

  toCancelLeave(rowData: any) {
    console.log(rowData);

    const params = {
      isLeaveCancelled: true,
      leaveCancelledAt: new Date(),
      cancelledBy: 'ADMIN',
      docId: rowData.docId
    };
    this.firebaseService.updateLeaveStatus(params);
  }

  toEditTrip(rowData: any) {
    console.log(rowData);
    // const navigationExtras: NavigationExtras = {
    //   state: {
    //     rowData: rowData,
    //     path: 'EDIT_DRIVER_BOOKING'
    //   }
    // };
    // this.router.navigate(['/driverBookings'], navigationExtras);
  }
}

export interface AppliedLeaves {
  position: number;
  driverName: string;
  driverMobileNumber: number;
  leaveReason: string;
  leaveType: string;
  numberOfDays: string;
  isLeaveCancelled: boolean;
}
