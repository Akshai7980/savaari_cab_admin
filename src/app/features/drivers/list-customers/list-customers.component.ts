import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { TableConfig } from '../../../core/models/table-config.model';
import { DriverBooking } from '../../../core/models/booking.model';
import { DynamicSummaryTableComponent } from '../../../shared/components/dynamic-summary-table/dynamic-summary-table.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ElementDetailedViewComponent } from '../../../shared/components/element-detailed-view/element-detailed-view.component';

export interface CustomerDisplay {
  position?: number;
  customerName: string;
  customerNumber: string;
  address: string;
  totalBookings: number;
  bookings: DriverBooking[];
}

@Component({
  selector: 'app-list-customers',
  standalone: true,
  imports: [
    CommonModule,
    DynamicSummaryTableComponent,
    FormLoaderComponent
  ],
  templateUrl: './list-customers.component.html',
  styleUrls: ['./list-customers.component.scss'],
  providers: [TitleCasePipe]
})
export default class ListCustomersComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private titleCasePipe = inject(TitleCasePipe);

  tableConfig!: TableConfig;
  customerData: CustomerDisplay[] = [];
  isLoading = signal<boolean>(true);

  private dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this.loadTableConfig();
    this.getCustomerList();
  }

  loadTableConfig(): void {
    this.utilityService.getJSON('assets/configs/list-customers.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.tableConfig = data as TableConfig;
      });
  }

  /**
   * Extracts unique customers from driver bookings.
   * Groups by customerNumber and aggregates booking counts.
   */
  getCustomerList(): void {
    this.firebaseService.getDriverBooking()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: DriverBooking[]) => {
          const customerMap = new Map<string, CustomerDisplay>();

          res.forEach(booking => {
            const key = booking.customerNumber || booking.customerName;
            if (!key) return;

            if (customerMap.has(key)) {
              const existing = customerMap.get(key)!;
              existing.totalBookings += 1;
              existing.bookings.push(booking);
            } else {
              customerMap.set(key, {
                customerName: booking.customerName || '',
                customerNumber: booking.customerNumber || '',
                address: booking.address || '',
                totalBookings: 1,
                bookings: [booking]
              });
            }
          });

          this.customerData = Array.from(customerMap.values()).map((item, index) => ({
            ...item,
            position: index + 1
          }));
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching customer data:', error);
          this.isLoading.set(false);
        }
      });
  }

  onTableAction(event: { actionID: string; row: CustomerDisplay }): void {
    switch (event.actionID) {
      case 'view':
        this.toViewCustomer(event.row);
        break;
    }
  }

  toViewCustomer(element: CustomerDisplay): void {
    this.dialog.closeAll();

    const data = [
      { key: 'Customer Name', value: this.titleCasePipe.transform(element.customerName || '') },
      { key: 'Contact Number', value: element.customerNumber || '--' },
      { key: 'Address', value: this.titleCasePipe.transform(element.address || '') || '--' },
      { key: 'Total Bookings', value: element.totalBookings?.toString() || '0' },
      {
        key: 'Recent Trip', value: element.bookings.length > 0
          ? `${element.bookings[element.bookings.length - 1].pickUpLocation || '--'} → ${element.bookings[element.bookings.length - 1].dropOffLocation || '--'}`
          : '--'
      }
    ];

    this.dialogRef = this.dialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${this.titleCasePipe.transform(element.customerName || '')} | Customer Details`,
        buttons1: '',
        buttons2: 'Close',
        delete: () => {
          this.dialogRef.close();
        }
      }
    });
  }
}
