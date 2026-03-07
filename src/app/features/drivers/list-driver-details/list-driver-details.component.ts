import { CommonModule, TitleCasePipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DataShareService } from 'src/app/core/services/data-share.service';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { AlertPopupComponent } from 'src/app/shared/components/alert-popup/alert-popup.component';
import { ElementDetailedViewComponent } from 'src/app/shared/components/element-detailed-view/element-detailed-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Driver } from 'src/app/core/models/driver.model';

export interface DriverDisplay extends Driver {
  position?: number;
}

@Component({
  selector: 'app-list-driver-details',
  standalone: true,
  templateUrl: './list-driver-details.component.html',
  styleUrls: ['./list-driver-details.component.scss'],
  imports: [CommonModule, SharedModule],
  providers: [TitleCasePipe]
})
export default class ListDriverDetailsComponent implements OnInit, AfterViewChecked {
  displayedColumns: string[] = ['position', 'driverName', 'mobileNumber', 'driverType', 'district', 'actions'];
  dataSource = new MatTableDataSource<DriverDisplay>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  showPaginator = false;
  private dialogRef: any;

  constructor(
    private readonly dataSharingService: DataShareService,
    private readonly firebaseService: FirebaseService,
    private readonly titleCase: TitleCasePipe,
    private readonly matDialog: MatDialog,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.getDriverList();
  }

  ngAfterViewChecked(): void {
    if (this.showPaginator && !this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.showPaginator && this.dataSource.paginator) {
      this.dataSource.paginator = null;
    }
  }

  getDriverList(): void {
    this.firebaseService.getDriverList().subscribe(
      (res: Driver[]) => {
        const mappedData: DriverDisplay[] = res.map((item, index) => ({
          ...item,
          position: index + 1
        }));

        this.dataSource.data = mappedData;
        this.showPaginator = mappedData.length > 5;
      },
      (error) => {
        console.error('Error fetching driver registrations:', error);
      }
    );
  }

  toViewDriverDetails(element: DriverDisplay): void {
    this.matDialog.closeAll();

    const data = [
      {
        key: 'Driver Name',
        value: this.titleCase.transform(element?.driverName ?? element?.fullName ?? '')
      },
      { key: 'Driver Mobile Number', value: `+91-${element.mobileNumber || ''}` },
      { key: 'Driver Type', value: this.titleCase.transform(element.driverType || '') },
      { key: 'Address', value: this.titleCase.transform(element.address || '') },
      { key: 'Location', value: this.titleCase.transform(element.district || '') },
      { key: 'Driver Code', value: element.driverCode || '' },
      { key: 'Driving License', value: element.licenseNumber || '' },
      { key: 'Alternate Mobile Number', value: `+91-${element.altMobileNumber || ''}` }
    ];

    this.dialogRef = this.matDialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${this.titleCase.transform(element?.driverName ?? element?.fullName ?? '')} | ${element.driverType || ''}`,
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

  toDeleteDriverDetails(element: DriverDisplay): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

    this.dialogRef = this.matDialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: 'Are you sure?',
        content: `Are you sure you want to delete Savaari Driver <strong> ${this.titleCase.transform(
          element?.driverName ?? element?.fullName ?? ''
        )}'s </strong> from drivers list? <br> This will delete the driver details from Savaari Database, but we will keep a backup for future use.`,
        buttons: ['Close Window', 'Delete Driver'],
        onButtonClick: (e: string) => {
          if (e === 'Delete Driver') {
            this.dialogRef.close();
            const params = {
              isLeaveCancelled: true,
              leaveCancelledAt: new Date(),
              cancelledBy: 'ADMIN',
              docId: element.id || element.docId
            };
            this.firebaseService.updateLeaveStatus(params as any);
          } else {
            this.dialogRef.close();
          }
        }
      }
    });
  }

  toEditDriverDetails(rowData: DriverDisplay): void {
    rowData.path = 'EDIT_DRIVER_DETAILS';
    this.dataSharingService.updateData(rowData);
    this.router.navigate(['/editDriverDetails']);
  }
}
