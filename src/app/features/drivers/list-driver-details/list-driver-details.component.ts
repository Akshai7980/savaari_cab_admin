import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { DataShareService } from '../../../core/services/data-share.service';
import { TableConfig } from '../../../core/models/table-config.model';
import { Driver } from '../../../core/models/driver.model';
import { DynamicSummaryTableComponent } from '../../../shared/components/dynamic-summary-table/dynamic-summary-table.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ElementDetailedViewComponent } from '../../../shared/components/element-detailed-view/element-detailed-view.component';
import { AlertPopupComponent } from '../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-list-driver-details',
  standalone: true,
  imports: [
    CommonModule,
    DynamicSummaryTableComponent,
    FormLoaderComponent
  ],
  templateUrl: './list-driver-details.component.html',
  styleUrls: ['./list-driver-details.component.scss'],
  providers: [TitleCasePipe]
})
export default class ListDriverDetailsComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private dataShareService = inject(DataShareService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private titleCasePipe = inject(TitleCasePipe);

  tableConfig!: TableConfig;
  driverData: Driver[] = [];
  isLoading = signal<boolean>(true);

  private dialogRef!: MatDialogRef<any>;

  ngOnInit(): void {
    this.loadTableConfig();
    this.getDriverList();
  }

  loadTableConfig(): void {
    this.utilityService.getJSON('assets/configs/list-driver-details.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.tableConfig = data as TableConfig;
      });
  }

  getDriverList(): void {
    this.firebaseService.getDriverList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (res: Driver[]) => {
          this.driverData = res.map((item, index) => ({
            ...item,
            position: index + 1
          }));
          this.isLoading.set(false);
        },
        (error) => {
          console.error('Error fetching driver registrations:', error);
          this.isLoading.set(false);
        }
      );
  }

  onTableAction(event: { actionID: string; row: Driver }): void {
    switch (event.actionID) {
      case 'view':
        this.toViewDriverDetails(event.row);
        break;
      case 'delete':
        this.toDeleteDriverDetails(event.row);
        break;
      case 'edit':
        this.toEditDriverDetails(event.row);
        break;
    }
  }

  toViewDriverDetails(element: Driver): void {
    this.dialog.closeAll();

    const data = [
      {
        key: 'Driver Name',
        value: this.titleCasePipe.transform(element?.driverName ?? element?.fullName ?? '')
      },
      { key: 'Driver Mobile Number', value: `+91-${element.mobileNumber || ''}` },
      { key: 'Driver Type', value: this.titleCasePipe.transform(element.driverType || '') },
      { key: 'Address', value: this.titleCasePipe.transform(element.address || '') },
      { key: 'Location', value: this.titleCasePipe.transform(element.district || '') },
      { key: 'Driver Code', value: element.driverCode || '' },
      { key: 'Driving License', value: element.licenseNumber || '' },
      { key: 'Alternate Mobile Number', value: `+91-${element.altMobileNumber || ''}` }
    ];

    this.dialogRef = this.dialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${this.titleCasePipe.transform(element?.driverName ?? element?.fullName ?? '')} | ${element.driverType || ''}`,
        buttons1: 'Edit',
        buttons2: 'Cancel',
        edit: () => {
          this.dialogRef.close();
          this.toEditDriverDetails(element);
        },
        delete: () => {
          this.dialogRef.close();
          this.toDeleteDriverDetails(element);
        }
      }
    });
  }

  toDeleteDriverDetails(element: Driver): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

    this.dialogRef = this.dialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: 'Are you sure?',
        content: `Are you sure you want to delete Savaari Driver <strong> ${this.titleCasePipe.transform(
          element?.driverName ?? element?.fullName ?? ''
        )}'s </strong> from drivers list? <br> This will delete the driver details from Savaari Database, but we will keep a backup for future use.`,
        buttons: ['Close Window', 'Delete Driver'],
        onButtonClick: (e: string) => {
          if (e === 'Delete Driver') {
            this.dialogRef.close();
            const docId = element.id || element.docId;
            if (docId) {
              this.firebaseService.deactivateDriver({
                docId,
                deactivatedAt: new Date(),
                deactivatedBy: 'ADMIN'
              }).then(() => {
                console.log('Driver deactivated:', docId);
                this.getDriverList(); // Refresh the list
              });
            }
          } else {
            this.dialogRef.close();
          }
        }
      }
    });
  }

  toEditDriverDetails(rowData: Driver): void {
    (rowData as any).path = 'EDIT_DRIVER_DETAILS';
    this.dataShareService.updateData(rowData);
    this.router.navigate(['/editDriverDetails']);
  }
}
