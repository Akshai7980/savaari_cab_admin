import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UtilityService } from 'src/app/services/utility.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ListAllDriversComponent } from 'src/app/theme/shared/components/list-all-drivers/list-all-drivers.component';

@Component({
  selector: 'app-trip-detail-view',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule],
  templateUrl: './trip-detail-view.component.html',
  styleUrls: ['./trip-detail-view.component.scss']
})
export default class TripDetailViewComponent implements OnInit {

  displayedColumns: string[] = ['key', 'value'];
  dataSource = new MatTableDataSource([]);
  id: string;
  bookingDetail: DriverBookingDetail;
  bookingStatus: string;
  dialogRef: any;
  allDrivers: any;
  excludedKeys: string[] = ['startDate', 'endDate', 'startTime', 'pickUpLocation', 'dropOffLocation'];


  constructor(
    private readonly router: Router,
    private readonly firebaseService: FirebaseService,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const path = this.router.url;
    this.id = path.split('/')[3];
    this.firebaseService.getBookingDetailById(this.id).then((bookingDetail: DriverBookingDetail) => {
      bookingDetail.startTime = bookingDetail.startTime? this.utilityService.convertTo24Hour(bookingDetail.startTime): null;
      this.bookingDetail = bookingDetail;
      this.bookingStatus = bookingDetail.status;
      this.patchDate(bookingDetail);
    });
    this.getAllDrivers();
  }

  getAllDrivers() {
    this.firebaseService.getDriverList().subscribe((res: any) => {
      if (res && res.length > 0) {
        this.allDrivers = res;
      }
    });
  }

  patchDate(data) {
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
    this.firebaseService.updateTripStatus(this.bookingDetail).then((data) => {
      this.router.navigate([path]);
    });
  }

  valueChange(key, value) {
    if (value.target.type === 'time') {
      this.bookingDetail[key] = this.utilityService.convertTo12HourFormat(value.target.value);
    } else {
      this.bookingDetail[key] = value.target.value;
    }
  }

  openDriversList(event) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    
    this.dialogRef = this.dialog.open(ListAllDriversComponent, {
      ...dialogConfig,
      data: { drivers: this.allDrivers }
    });

    this.dialogRef.afterClosed().subscribe((selectedDrivers) => {
      event.target.value = selectedDrivers.driverName;
      this.bookingDetail.selectedDriver = selectedDrivers.driverName;
    });
  }
}



export interface DriverBookingDetail {
  customerName: string,
  address: string,
  pickUpLocation: string,
  dropOffLocation: string,
  customerNumber: number,
  startDate: string,
  endDate: string,
  startTime: string,
  numberOfDays: string,
  requiredDriver: string,
  rejectedDriver: string,
  cusVehicleName: string,
  cusVehicleType: string,
  cusVehicleNumber: string,
  docId: string,
  status: string,
  selectedDriver: string
}
