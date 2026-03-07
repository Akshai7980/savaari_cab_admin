import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { VehicleNumberPipe } from 'src/app/shared/pipes/vehicle-number/vehicle-number.pipe';
import { DriverBooking } from 'src/app/core/models/booking.model';

export interface DriverBookingDisplay extends DriverBooking {
  position?: number;
}

@Component({
  selector: 'app-driver-booking-list',
  standalone: true,
  imports: [CommonModule, SharedModule, VehicleNumberPipe],
  templateUrl: './driver-booking-list.component.html',
  styleUrls: ['./driver-booking-list.component.scss']
})
export default class DriverBookingListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'tripTime', 'customerName', 'location', 'destination', 'vehicleName', 'actions'];
  dataSource = new MatTableDataSource<DriverBookingDisplay>([]);
  driverBookings: DriverBookingDisplay[] = [];
  listType: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.getBookingList();

    const url = this.router.url;
    this.listType = url.includes('driverBookingList') ? 'today' :
      url.includes('runningTrip') ? 'running' :
        url.includes('upcomingTrip') ? 'upcoming' : 'closed';
  }

  getBookingList(): void {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime();

    this.firebaseService.getDriverBooking().subscribe(
      (res: DriverBooking[]) => {
        let bookingList: DriverBookingDisplay[] = [];

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
            if (!this.displayedColumns.includes('selectedDriver')) {
              this.displayedColumns.splice(this.displayedColumns.length - 1, 0, 'selectedDriver');
            }
            bookingList = res.filter(booking => booking.status === 'running');
            break;

          case 'upcoming':
            bookingList = res.filter((booking) => {
              const bookingTimestamp = new Date(booking.startDate).getTime();
              return booking.status === 'yts' && bookingTimestamp > todayEnd;
            });
            break;

          case 'closed':
            if (!this.displayedColumns.includes('selectedDriver')) {
              this.displayedColumns.splice(this.displayedColumns.length - 1, 0, 'selectedDriver');
            }
            bookingList = res.filter(booking => booking.status === 'closed');
            break;
        }

        this.driverBookings = bookingList.map((item, index) => ({
          ...item,
          position: index + 1
        }));
        this.dataSource.data = this.driverBookings;
      },
      (error) => {
        console.error('Error fetching driver bookings:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  toViewTrip(rowData: DriverBookingDisplay): void {
    this.router.navigate([`tripDetail/today/${rowData.docId}`]);
  }

  toCloseTrip(rowData: DriverBookingDisplay): void {
    if (rowData.docId) {
      const params = {
        status: 'closed',
        tripCancelledBy: 'Admin',
        docId: rowData.docId
      } as any;
      this.firebaseService.updateTripStatus(params);
    }
  }

  toCancelTrip(rowData: DriverBookingDisplay): void {
    if (rowData.docId) {
      const params = {
        isTripCancelled: true,
        status: 'canceled',
        tripCancellationTime: new Date().toISOString(),
        tripCancelledBy: 'Admin',
        docId: rowData.docId
      } as any;
      this.firebaseService.updateTripStatus(params);
    }
  }

  toEditTrip(rowData: DriverBookingDisplay): void {
    if (this.listType === 'today') {
      this.router.navigate(['driverBookings'], { queryParams: { id: rowData.docId } });
    } else {
      this.router.navigate([`/tripDetail/running/${rowData.docId}`]);
    }
  }
}
