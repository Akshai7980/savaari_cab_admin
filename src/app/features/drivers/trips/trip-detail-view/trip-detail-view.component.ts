import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UtilityService } from 'src/app/core/services/utility.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ListAllDriversComponent } from 'src/app/shared/components/list-all-drivers/list-all-drivers.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DriverBooking } from 'src/app/core/models/booking.model';
import { Driver } from 'src/app/core/models/driver.model';

@Component({
  selector: 'app-trip-detail-view',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule],
  templateUrl: './trip-detail-view.component.html',
  styleUrls: ['./trip-detail-view.component.scss']
})
export default class TripDetailViewComponent implements OnInit {

  displayedColumns: string[] = ['key', 'value'];
  dataSource = new MatTableDataSource<any>([]);
  id: string;
  bookingDetail: DriverBooking;
  bookingStatus: string;
  dialogRef: any;
  allDrivers: Driver[] = [];
  excludedKeys: string[] = ['startDate', 'endDate', 'startTime', 'pickUpLocation', 'dropOffLocation'];
  private destroyRef = inject(DestroyRef);

  constructor(
    private readonly router: Router,
    private readonly firebaseService: FirebaseService,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const path = this.router.url;
    this.id = path.split('/')[3];
    this.firebaseService.getBookingDetailById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bookingDetail: DriverBooking | null) => {
        if (bookingDetail) {
          bookingDetail.startTime = bookingDetail.startTime ? this.utilityService.convertTo24Hour(bookingDetail.startTime) : '';
          this.bookingDetail = bookingDetail;
          this.bookingStatus = bookingDetail.status;
          this.patchDate(bookingDetail);
        }
      });
    this.getAllDrivers();
  }

  getAllDrivers() {
    this.firebaseService.getDriverList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Driver[]) => {
        if (res && res.length > 0) {
          this.allDrivers = res;
        }
      });
  }

  patchDate(data: DriverBooking) {
    let source = [
      { 'key': 'docId', 'property': 'Id', 'value': data.docId },
      { 'key': 'customerName', 'property': 'Customer Name', 'value': data.customerName },
      { 'key': 'address', 'property': 'Address', 'value': data.address },
      { 'key': 'pickUpLocation', 'property': 'Pick Up Location', 'value': data.pickUpLocation },
      { 'key': 'dropOffLocation', 'property': 'Drop Off Location', 'value': data.dropOffLocation },
      { 'key': 'customerNumber', 'property': 'Customer Number', 'value': data.customerNumber },
      { 'key': 'startDate', 'property': 'Start Date', 'value': data.startDate },
      { 'key': 'endDate', 'property': 'End Date', 'value': data.endDate },
      { 'key': 'startTime', 'property': 'Start Time', 'value': data.startTime },
      { 'key': 'numberOfDays', 'property': 'Number of Days', 'value': data.numberOfDays },
      { 'key': 'requiredDriver', 'property': 'Required Driver', 'value': data.requiredDriver },
      { 'key': 'rejectedDriver', 'property': 'Rejected Driver', 'value': data.rejectedDriver },
      { 'key': 'cusVehicleName', 'property': 'Customer Veicle Name', 'value': data.cusVehicleName },
      { 'key': 'cusVehicleType', 'property': 'Customer Veicle Type', 'value': data.cusVehicleType },
      { 'key': 'cusVehicleNumber', 'property': 'Customer Veicle Number', 'value': data.cusVehicleNumber },
      { 'key': 'selectedDriver', 'property': 'Selected Driver', 'value': data.selectedDriver },
    ]
    this.dataSource.data = source;
  }

  toStartTrip() {
    this.bookingDetail.status = 'running';
    this.updateBooking('runningTrip')
  }

  toCancelTrip() {
    this.bookingDetail.status = 'canceled';
    this.updateBooking();
  }

  toEditTrip() {
    this.router.navigate(['driverBookings'], { queryParams: { id: this.id } })
  }

  toCloseTrip() {
    this.bookingDetail.status = 'closed';
    this.updateBooking();
  }

  updateBooking(path: string = 'driverBookings') {
    if (this.bookingDetail.docId) {
      this.firebaseService.updateTripStatus(this.bookingDetail as DriverBooking & { docId: string }).then(() => {
        this.router.navigate([path]);
      });
    }
  }

  valueChange(key: keyof DriverBooking, value: any) {
    if (value.target.type === 'time') {
      (this.bookingDetail as any)[key] = this.utilityService.convertTo12HourFormat(value.target.value);
    } else {
      (this.bookingDetail as any)[key] = value.target.value;
    }
  }

  openDriversList(event: any) {
    const dialogConfig = new MatDialogConfig<any>();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.allDrivers }
    });

    dialogRef.afterClosed().subscribe((selectedDrivers: Driver) => {
      if (selectedDrivers) {
        event.target.value = selectedDrivers.driverName;
        this.bookingDetail.selectedDriver = selectedDrivers.driverName;
      }
    });
  }
}
