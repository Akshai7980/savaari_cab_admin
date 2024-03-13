import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataShareService } from 'src/app/services/data-share.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AlertPopupComponent } from 'src/app/theme/shared/components/alert-popup/alert-popup.component';
import { ElementDetailedViewComponent } from 'src/app/theme/shared/components/element-detailed-view/element-detailed-view.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'list-driver-leave',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './list-driver-leave.component.html',
  styleUrls: ['./list-driver-leave.component.scss'],
  providers: [DatePipe, TitleCasePipe]
})
export default class ListDriverLeaveComponent implements OnInit, AfterViewChecked {
  displayedColumns: string[] = ['position', 'driverName', 'driverMobileNumber', 'leaveReason', 'leaveType', 'numberOfDays', 'actions'];
  dataSource = new MatTableDataSource<AppliedLeaves>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showPaginator: boolean = false;
  private subscription: Subscription[] = [];
  private dialogRef;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly dataShareService: DataShareService,
    private readonly titleCase: TitleCasePipe,
    private readonly matDialog: MatDialog,
    private readonly datePipe: DatePipe,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.matDialog.closeAll();
      }
    });

    this.subscription.push(subscription);

    this.getDriverAppliedLeaves();
  }

  ngAfterViewChecked() {
    if (this.showPaginator && !this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.showPaginator && this.dataSource.paginator) {
      this.dataSource.paginator = null;
    }
  }

  getDriverAppliedLeaves() {
    const subscription = this.firebaseService.getDriverAppliedLeaves().subscribe(
      (res: AppliedLeaves[]) => {
        console.log(res);
        const response = [];
        let position = 1;

        res.forEach((element) => {
          if (!element.isLeaveCancelled) {
            element.position = position++;
            element.isLeaveCancelled = false;
          }

          if (!element.isLeaveCancelled) response.push(element);
        });

        this.dataSource.data = response;
        if (this.dataSource.data.length > 5) this.showPaginator = true;
        else this.showPaginator = false;
      },
      (error) => {
        console.error('Error fetching driver bookings:', error);
      }
    );

    this.subscription.push(subscription);
  }

  toViewLeave(element) {
    console.log(element);

    this.matDialog.closeAll();

    const startDate = this.datePipe.transform(element.leaveStartDate, 'longDate');
    const endDate = this.datePipe.transform(element.leaveEndDate, 'longDate');

    const data = [
      { key: 'Driver Name', value: this.titleCase.transform(element.driverName) },
      { key: 'Driver Mobile Number', value: '+91-' + element.driverMobileNumber },
      { key: 'Leave Reason', value: this.titleCase.transform(element.leaveReason) },
      { key: 'Leave Type', value: element?.leaveType === 'FULL' ? 'Full Day' : 'Half Day' },
      { key: 'No: Of Days Leave', value: element.numberOfDays },
      { key: 'Driver Type', value: this.titleCase.transform(element.driverType) },
      { key: 'Leave Start Date', value: startDate },
      { key: 'Leave End Date', value: endDate }
    ];

    this.dialogRef = this.matDialog.open(ElementDetailedViewComponent, {
      data: {
        data: data,
        heading: `${element.driverName} | Leave From ${startDate} To ${endDate}`,
        buttons1: 'Edit',
        buttons2: 'Cancel',

        edit: () => {
          this.dialogRef.close();
          this.toEditLeave(element);
        },

        delete: () => {
          this.dialogRef.close();
          this.toCancelLeave(element);
        }
      }
    });
  }

  toCancelLeave(element) {
    console.log(element);

    const startDate = this.datePipe.transform(element.leaveStartDate, 'longDate');
    const endDate = this.datePipe.transform(element.leaveEndDate, 'longDate');
    const driverName = this.titleCase.transform(element.driverName);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';

    this.dialogRef = this.matDialog.open(AlertPopupComponent, {
      ...dialogConfig,
      data: {
        icon: 'close',
        image: '../../../../assets/images/alert.svg',
        heading: `${'Are you sure ?'}`,
        content: ` Are you sure you want to cancel Savaari Driver <strong> ${driverName} 's </strong> leave from <br> <strong> ${startDate} </strong> to <strong> ${endDate} </strong> `,
        buttons: ['Cancel Leave', 'Don`t Cancel'],
        onButtonClick: (e) => {
          console.log('button click', e);

          switch (e) {
            case 'Cancel Leave':
              this.dialogRef.close();

              const params = {
                isLeaveCancelled: true,
                leaveCancelledAt: new Date(),
                cancelledBy: 'ADMIN',
                docId: element.docId
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

  toEditLeave(element) {
    console.log(element);
    this.dataShareService.updateData(element);
    this.router.navigate(['applyDriverLeave']);
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.forEach((element) => {
        element.unsubscribe();
      });
  }
}

export interface AppliedLeaves {
  position: number;
  driverName: string;
  driverMobileNumber: number;
  leaveReason: string;
  leaveType: string;
  numberOfDays: string;
  isLeaveCancelled: boolean;
}
