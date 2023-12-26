import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationExtras, Router } from '@angular/router';
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
  displayedColumns: string[] = ['position', 'tripTime', 'customerName', 'location', 'destination', 'vehicleName', 'actions'];
  dataSource = new MatTableDataSource<DriverBookings>([]);
  driverBookings: DriverBookings[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getTodaysDriverBookings();
  }

  getTodaysDriverBookings() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const todayStart = new Date(currentYear, currentMonth, currentDate, 0, 0, 0, 0).getTime();
    const todayEnd = new Date(currentYear, currentMonth, currentDate, 23, 59, 59, 999).getTime();

    this.firebaseService.getDriverBooking().subscribe(
      (res: DriverBookings[]) => {
        const todaysDriverBookings = res.filter((booking) => {
          const bookingTimestamp = new Date(booking.startDate).getTime();
          return bookingTimestamp >= todayStart && bookingTimestamp <= todayEnd && !booking.isTripCancelled;
        });

        console.log(todaysDriverBookings);
        this.driverBookings = todaysDriverBookings;
        this.dataSource.data = todaysDriverBookings;

        this.driverBookings.forEach((element, index) => {
          if (element) {
            element.position = index + 1;
          }
        });
      },
      (error) => {
        console.error('Error fetching driver bookings:', error);
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // toGiveTrip(rowData: any) {
  //   console.log(rowData);
  //   rowData.isTripActivated = true;
  //   rowData.tripStartTime = new Date();
  //   rowData.tripStartActionBy = 'Admin';
  //   this.firebaseService.updateTripStatus(rowData);
  // }

  toViewTrip(rowData: any) {
    console.log(rowData);
  }

  toCancelTrip(rowData: any) {
    console.log(rowData);

    const params = {
      isTripCancelled: true,
      tripCancellationTime: new Date(),
      tripCancelledBy: 'Admin',
      docId: rowData.docId
    };
    this.firebaseService.updateTripStatus(params);
  }

  toEditTrip(rowData: any) {
    console.log(rowData);
    const navigationExtras: NavigationExtras = {
      state: {
        rowData: rowData,
        path: 'EDIT_DRIVER_BOOKING'
      }
    };
    this.router.navigate(['/driverBookings'], navigationExtras);
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
  ref: any;
  docId: string;
  startDate: string;
  startTime: string;
  isTripCancelled?: boolean;
}
