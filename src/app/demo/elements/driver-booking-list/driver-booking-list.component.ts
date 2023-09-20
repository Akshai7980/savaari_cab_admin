import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-driver-booking-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './driver-booking-list.component.html',
  styleUrls: ['./driver-booking-list.component.scss']
})
export default class DriverBookingListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'customerName', 'customerNumber', 'driverName', 'driverNumber', 'bookingDate', 'bookingTime'];
  dataSource = new MatTableDataSource<DriverBookings>([]);
  driverBookings: DriverBookings[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private readonly firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.getDriverBooking();
  }

  getDriverBooking() {
    this.firebaseService.getDriverBooking().subscribe((res: DriverBookings[]) => {
      console.log(res);
      this.driverBookings = res;
      this.dataSource.data = res;

      this.driverBookings.forEach((element, index: number) => {
        if (element) {
          element.position = index + 1;
        }
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}

export interface DriverBookings {
  position: number;
  customerName: string;
  customerNumber: string;
  driverName: string;
  driverNumber: string;
  bookingDate: string;
  bookingTime: string;
}
