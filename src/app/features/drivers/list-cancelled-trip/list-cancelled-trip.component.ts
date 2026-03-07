import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { VehicleNumberPipe } from 'src/app/shared/pipes/vehicle-number/vehicle-number.pipe';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { DriverBooking } from 'src/app/core/models/booking.model';

export interface DriverBookingDisplay extends DriverBooking {
  position?: number;
}

@Component({
  selector: 'app-list-cancelled-trip',
  templateUrl: './list-cancelled-trip.component.html',
  styleUrls: ['./list-cancelled-trip.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, VehicleNumberPipe]
})
export default class ListCancelledTripComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'tripTime', 'customerName', 'location', 'destination', 'vehicleName', 'actions'];
  dataSource = new MatTableDataSource<DriverBookingDisplay>([]);
  driverBookings: DriverBookingDisplay[] = [];
  listType: string = 'closed';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.getBookingList();
  }

  getBookingList(): void {
    this.firebaseService.getDriverBooking().subscribe(
      (res: DriverBooking[]) => {
        const bookingList = res.filter(booking => booking.status === 'canceled' || booking.isTripCancelled);

        this.driverBookings = bookingList.map((item, index) => ({
          ...item,
          position: index + 1
        }));
        this.dataSource.data = this.driverBookings;
      },
      (error) => {
        console.error('Error fetching cancelled trips:', error);
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
      };
      this.firebaseService.updateTripStatus(params as any);
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
      };
      this.firebaseService.updateTripStatus(params as any);
    }
  }

  toEditTrip(rowData: DriverBookingDisplay): void {
    this.router.navigate(['driverBookings'], { queryParams: { id: rowData.docId } });
  }
}
