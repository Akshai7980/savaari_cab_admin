import { CommonModule, TitleCasePipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DataShareService } from 'src/app/services/data-share.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AlertPopupComponent } from 'src/app/theme/shared/components/alert-popup/alert-popup.component';
import { ElementDetailedViewComponent } from 'src/app/theme/shared/components/element-detailed-view/element-detailed-view.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

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
  dataSource = new MatTableDataSource<ListAllDrivers>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showPaginator: boolean = false;
  private dialogRef;

  constructor(
    private readonly dataSharingService: DataShareService,
    private readonly firebaseService: FirebaseService,
    private readonly titleCase: TitleCasePipe,
    private readonly matDialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getDriverList();
  }

  ngAfterViewChecked() {
    if (this.showPaginator && !this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.showPaginator && this.dataSource.paginator) {
      this.dataSource.paginator = null;
    }
  }

  getDriverList() {
    this.firebaseService.getDriverList().subscribe(
      (res: ListAllDrivers[]) => {
        console.log(res);

        const response = [];
        let position = 1;

        res.forEach((element) => {
          element.position = position++;
          response.push(element);
        });

        this.dataSource.data = response;
        if (this.dataSource.data.length > 5) this.showPaginator = true;
        else this.showPaginator = false;
      },
      (error) => {
        console.error('Error fetching driver bookings:', error);
      }
    );
  }

  toViewDriverDetails(element: ListAllDrivers) {
    this.matDialog.closeAll();

    const data = [
      {
        key: 'Driver Name',
        value: this.titleCase.transform(element?.driverName ?? element?.fullName ?? '')
      },
      { key: 'Driver Mobile Number', value: `+91-${element.mobileNumber}` },
      { key: 'Driver Type', value: this.titleCase.transform(element.driverType) },
      { key: 'Address', value: this.titleCase.transform(element.address) },
      { key: 'Location', value: this.titleCase.transform(element.district) },
      { key: 'Driver Code', value: element.driverCode },
      { key: 'Driving License', value: element.licenseNumber },
      { key: 'Alternate Mobile Number', value: `+91-${element.altMobileNumber}` }
    ];

    this.dialogRef = this.matDialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${this.titleCase.transform(element?.driverName ?? element?.fullName ?? '')} | ${element.driverType}`,
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

  toDeleteDriverDetails(element: ListAllDrivers) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';
    dialogConfig.hasBackdrop = true;

    this.dialogRef = this.matDialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: `${'Are you sure ?'}`,
        content: ` Are you sure you want to delete Savaari Driver <strong> ${this.titleCase.transform(
          element?.driverName ?? element?.fullName ?? ''
        )} 's </strong> from drivers list ? <br> This will delete the driver details from Savaari Database, but we will keep a backup for future use.`,
        buttons: ['Close Window', 'Delete Driver'],
        onButtonClick: (e) => {
          console.log('button click', e);

          switch (e) {
            case 'Delete Driver':
              this.dialogRef.close();

              const params = {
                isLeaveCancelled: true,
                leaveCancelledAt: new Date(),
                cancelledBy: 'ADMIN',
                docId: element.id
              };

              this.firebaseService.updateLeaveStatus(params);
              break;

            default:
              this.dialogRef.close();
              break;
          }
        }
      }
    });
  }

  toEditDriverDetails(rowData: ListAllDrivers) {
    console.log(rowData);
    rowData.path = 'EDIT_DRIVER_DETAILS';
    this.dataSharingService.updateData(rowData);
    this.router.navigate(['/editDriverDetails']);
  }
}

export interface ListAllDrivers {
  path: string;
  aadhaarNumber: string;
  address: string;
  altMobileNumber: number;
  bloodGroup: string;
  dateOfBirth: string;
  district: string;
  driverCode: string;
  driverType: string;
  firstName: string;
  fullName: string;
  id: string;
  lastName: string;
  licenseNumber: string;
  mobileNumber: number;
  position: number;
  driverName: string;
}
