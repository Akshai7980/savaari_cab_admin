import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { TableConfig } from '../../../core/models/table-config.model';
import { DriverBooking } from '../../../core/models/booking.model';
import { DynamicSummaryTableComponent } from '../../../shared/components/dynamic-summary-table/dynamic-summary-table.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ElementDetailedViewComponent } from '../../../shared/components/element-detailed-view/element-detailed-view.component';

export interface DriverBookingDisplay extends DriverBooking {
  position?: number;
}

@Component({
  selector: 'app-list-cancelled-trip',
  standalone: true,
  imports: [
    CommonModule,
    DynamicSummaryTableComponent,
    FormLoaderComponent
  ],
  templateUrl: './list-cancelled-trip.component.html',
  styleUrls: ['./list-cancelled-trip.component.scss'],
  providers: [TitleCasePipe]
})
export default class ListCancelledTripComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private titleCasePipe = inject(TitleCasePipe);

  tableConfig!: TableConfig;
  bookingData: DriverBookingDisplay[] = [];
  isLoading = signal<boolean>(true);

  private dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this.loadTableConfig();
    this.getBookingList();
  }

  loadTableConfig(): void {
    this.utilityService.getJSON('assets/configs/list-cancelled-trip.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.tableConfig = data as TableConfig;
      });
  }

  getBookingList(): void {
    this.firebaseService.getDriverBooking()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (res: DriverBooking[]) => {
          const bookingList = res.filter(
            booking => booking.status === 'canceled' || booking.isTripCancelled
          );

          this.bookingData = bookingList.map((item, index) => ({
            ...item,
            position: index + 1
          }));
          this.isLoading.set(false);
        },
        (error) => {
          console.error('Error fetching cancelled trips:', error);
          this.isLoading.set(false);
        }
      );
  }

  onTableAction(event: { actionID: string; row: DriverBookingDisplay }): void {
    switch (event.actionID) {
      case 'view':
        this.toViewTrip(event.row);
        break;
    }
  }

  toViewTrip(rowData: DriverBookingDisplay): void {
    this.dialog.closeAll();

    const data = [
      { key: 'Customer Name', value: this.titleCasePipe.transform(rowData.customerName || '') },
      { key: 'Customer Number', value: rowData.customerNumber || '--' },
      { key: 'Pick-up Location', value: this.titleCasePipe.transform(rowData.pickUpLocation || '') },
      { key: 'Drop-off Location', value: this.titleCasePipe.transform(rowData.dropOffLocation || '') },
      { key: 'Start Date', value: rowData.startDate || '--' },
      { key: 'Trip Time', value: rowData.startTime || '--' },
      { key: 'Number of Days', value: rowData.numberOfDays || '--' },
      { key: 'Vehicle', value: rowData.cusVehicleName ? `${rowData.cusVehicleName} (${rowData.cusVehicleType})` : '--' },
      { key: 'Required Driver', value: this.titleCasePipe.transform(rowData.requiredDriver || '') || '--' },
      { key: 'Selected Driver', value: this.titleCasePipe.transform(rowData.selectedDriver || '') || '--' },
      { key: 'Status', value: 'CANCELLED' },
      { key: 'Cancelled By', value: this.titleCasePipe.transform(rowData.tripCancelledBy || '') || '--' },
      { key: 'Cancellation Time', value: rowData.tripCancellationTime || '--' }
    ];

    this.dialogRef = this.dialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${this.titleCasePipe.transform(rowData.customerName || '')} | Cancelled Trip`,
        buttons1: 'View Full Details',
        buttons2: 'Close',
        edit: () => {
          this.dialogRef.close();
          this.router.navigate([`tripDetail/today/${rowData.docId}`]);
        },
        delete: () => {
          this.dialogRef.close();
        }
      }
    });
  }
}
