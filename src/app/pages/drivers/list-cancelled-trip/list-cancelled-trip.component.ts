import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { VehicleNumberPipe } from 'src/app/pipes/vehicle-number/vehicle-number.pipe';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-list-cancelled-trip',
  templateUrl: './list-cancelled-trip.component.html',
  styleUrls: ['./list-cancelled-trip.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, VehicleNumberPipe]
})
export default class ListCancelledTripComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'tripTime', 'customerName', 'location', 'destination', 'vehicleName', 'actions'];
  dataSource = new MatTableDataSource<DriverBookings>([]);
  driverBookings: DriverBookings[] = [];
  listType: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getBookingList();

    this.listType = this.router.url.includes('driverBookingList')
      ? 'today'
      : this.router.url.includes('runningTrip')
      ? 'running'
      : this.router.url.includes('upcomingTrip')
      ? 'upcoming'
      : 'closed';
  }

  getBookingList() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const todayStart = new Date(currentYear, currentMonth, currentDate, 0, 0, 0, 0).getTime();
    const todayEnd = new Date(currentYear, currentMonth, currentDate, 23, 59, 59, 999).getTime();

    this.firebaseService.getDriverBooking().subscribe(
      (res: DriverBookings[]) => {
        let bookingList;

        switch (this.listType) {
          case 'today':
            bookingList = res.filter((booking) => {
              const bookingTimestamp = new Date(booking.startDate).getTime();
              return (
                bookingTimestamp >= todayStart &&
                bookingTimestamp <= todayEnd &&
                !booking.isTripCancelled &&
                booking.status !== 'running' &&
                booking.status !== 'canceled' &&
                booking.status !== 'closed'
              );
            });
            break;

          case 'running':
            this.displayedColumns.splice(this.displayedColumns.length - 1, 0, 'selectedDriver');
            bookingList = res.filter((booking) => {
              return booking.status == 'running';
            });
            break;

          case 'upcoming':
            bookingList = res.filter((booking) => {
              const bookingTimestamp = new Date(booking.startDate).getTime();
              return booking.status == 'yts' && bookingTimestamp > todayEnd;
            });
            break;

          case 'closed':
            this.displayedColumns.splice(this.displayedColumns.length - 1, 0, 'selectedDriver');
            bookingList = res.filter((booking) => {
              return booking.status == 'closed';
            });
            break;
        }

        this.driverBookings = bookingList;
        this.dataSource.data = bookingList;

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

  toViewTrip(rowData: any) {
    console.log(rowData);
    this.router.navigate([`tripDetail/today/${rowData.docId}`]);
  }

  toCloseTrip(rowData: any) {
    const params = {
      status: 'closed',
      tripCancelledBy: 'Admin',
      docId: rowData.docId
    };

    this.firebaseService.updateTripStatus(params);
  }

  toCancelTrip(rowData: any) {
    console.log(rowData);

    const params = {
      isTripCancelled: true,
      status: 'canceled',
      tripCancellationTime: new Date(),
      tripCancelledBy: 'Admin',
      docId: rowData.docId
    };

    this.firebaseService.updateTripStatus(params);
  }

  toEditTrip(rowData: any) {
    console.log(rowData);
    if (this.listType === 'today') {
      this.router.navigate(['driverBookings'], { queryParams: { id: rowData.docId } });
    } else {
      this.router.navigate([`/tripDetail/running/${rowData.docId}`]);
    }
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
  status: string;
}
