import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { TableConfig, TableColumnConfig, TableActionConfig } from '../../../core/models/table-config.model';
import { DriverBooking } from '../../../core/models/booking.model';
import { DynamicSummaryTableComponent } from '../../../shared/components/dynamic-summary-table/dynamic-summary-table.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ElementDetailedViewComponent } from '../../../shared/components/element-detailed-view/element-detailed-view.component';
import { AlertPopupComponent } from '../../../shared/components/alert-popup/alert-popup.component';

export interface DriverBookingDisplay extends DriverBooking {
  position?: number;
}

@Component({
  selector: 'app-driver-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    DynamicSummaryTableComponent,
    FormLoaderComponent
  ],
  templateUrl: './driver-booking-list.component.html',
  styleUrls: ['./driver-booking-list.component.scss'],
  providers: [TitleCasePipe]
})
export default class DriverBookingListComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private titleCasePipe = inject(TitleCasePipe);

  tableConfig!: TableConfig;
  bookingData: DriverBookingDisplay[] = [];
  isLoading = signal<boolean>(true);
  listType = '';

  private dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this.resolveListType();
    this.loadTableConfig();
    this.getBookingList();
  }

  private resolveListType(): void {
    const url = this.router.url;
    this.listType = url.includes('driverBookingList') ? 'today' :
      url.includes('runningTrip') ? 'running' :
        url.includes('upcomingTrip') ? 'upcoming' : 'closed';
  }

  loadTableConfig(): void {
    this.utilityService.getJSON('assets/configs/driver-booking-list.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        const config = data as TableConfig;
        this.tableConfig = this.adjustConfigForListType(config);
      });
  }

  /**
   * Dynamically adjusts the table config based on the listType:
   * - Adds 'selectedDriver' column for running/closed trips.
   * - Filters action buttons based on context.
   */
  private adjustConfigForListType(config: TableConfig): TableConfig {
    const adjustedConfig = { ...config };

    // Add 'Selected Driver' column for running/closed trips
    if (this.listType === 'running' || this.listType === 'closed') {
      const driverColumn: TableColumnConfig = {
        columnID: 'selectedDriver',
        headerLabel: 'Selected Driver',
        transform: { pipe: 'titlecase', fallback: '--' }
      };
      adjustedConfig.columns = [...config.columns, driverColumn];
    }

    // Filter actions based on listType
    let allowedActions: string[] = [];
    switch (this.listType) {
      case 'today':
        allowedActions = ['view', 'cancel', 'edit'];
        break;
      case 'running':
        allowedActions = ['close', 'cancel', 'edit'];
        break;
      case 'upcoming':
        allowedActions = ['view', 'cancel', 'edit'];
        break;
      case 'closed':
        allowedActions = ['view'];
        break;
    }
    adjustedConfig.actions = config.actions!.filter(
      (a: TableActionConfig) => allowedActions.includes(a.actionID)
    );

    return adjustedConfig;
  }

  getBookingList(): void {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime();

    this.firebaseService.getDriverBooking()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
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
              bookingList = res.filter(booking => booking.status === 'running');
              break;

            case 'upcoming':
              bookingList = res.filter((booking) => {
                const bookingTimestamp = new Date(booking.startDate).getTime();
                return booking.status === 'yts' && bookingTimestamp > todayEnd;
              });
              break;

            case 'closed':
              bookingList = res.filter(booking => booking.status === 'closed');
              break;
          }

          this.bookingData = bookingList.map((item, index) => ({
            ...item,
            position: index + 1
          }));
          this.isLoading.set(false);
        },
        (error) => {
          console.error('Error fetching driver bookings:', error);
          this.isLoading.set(false);
        }
      );
  }

  onTableAction(event: { actionID: string; row: DriverBookingDisplay }): void {
    switch (event.actionID) {
      case 'view':
        this.toViewTrip(event.row);
        break;
      case 'close':
        this.toCloseTrip(event.row);
        break;
      case 'cancel':
        this.toCancelTrip(event.row);
        break;
      case 'edit':
        this.toEditTrip(event.row);
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
      { key: 'Status', value: (rowData.status || '').toUpperCase() }
    ];

    this.dialogRef = this.dialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${this.titleCasePipe.transform(rowData.customerName || '')} | Trip Details`,
        buttons1: 'Edit',
        buttons2: 'Close',
        edit: () => {
          this.dialogRef.close();
          this.toEditTrip(rowData);
        },
        delete: () => {
          this.dialogRef.close();
        }
      }
    });
  }

  toCloseTrip(rowData: DriverBookingDisplay): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

    this.dialogRef = this.dialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: 'Close This Trip?',
        content: `Are you sure you want to close the trip for <strong>${this.titleCasePipe.transform(
          rowData.customerName || ''
        )}</strong>? <br> This action will mark the trip as completed.`,
        buttons: ['Go Back', 'Close Trip'],
        onButtonClick: (e: string) => {
          if (e === 'Close Trip' && rowData.docId) {
            this.dialogRef.close();
            const params = {
              status: 'closed',
              tripCancelledBy: 'Admin',
              docId: rowData.docId
            } as any;
            this.firebaseService.updateTripStatus(params);
            this.getBookingList();
          } else {
            this.dialogRef.close();
          }
        }
      }
    });
  }

  toCancelTrip(rowData: DriverBookingDisplay): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

    this.dialogRef = this.dialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: 'Cancel This Trip?',
        content: `Are you sure you want to cancel the trip for <strong>${this.titleCasePipe.transform(
          rowData.customerName || ''
        )}</strong>? <br> This action cannot be undone.`,
        buttons: ['Go Back', 'Cancel Trip'],
        onButtonClick: (e: string) => {
          if (e === 'Cancel Trip' && rowData.docId) {
            this.dialogRef.close();
            const params = {
              isTripCancelled: true,
              status: 'canceled',
              tripCancellationTime: new Date().toISOString(),
              tripCancelledBy: 'Admin',
              docId: rowData.docId
            } as any;
            this.firebaseService.updateTripStatus(params);
            this.getBookingList();
          } else {
            this.dialogRef.close();
          }
        }
      }
    });
  }

  toEditTrip(rowData: DriverBookingDisplay): void {
    if (this.listType === 'today') {
      this.router.navigate(['driverBookings'], { queryParams: { id: rowData.docId } });
    } else {
      this.router.navigate([`/tripDetail/running/${rowData.docId}`]);
    }
  }
}
