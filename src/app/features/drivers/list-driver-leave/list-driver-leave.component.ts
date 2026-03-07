import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { AfterViewChecked, Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationStart, Router } from '@angular/router';
import { DataShareService } from 'src/app/core/services/data-share.service';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { AlertPopupComponent } from 'src/app/shared/components/alert-popup/alert-popup.component';
import { ElementDetailedViewComponent } from 'src/app/shared/components/element-detailed-view/element-detailed-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DriverLeave } from 'src/app/core/models/leave.model';

export interface DriverLeaveDisplay extends DriverLeave {
  position?: number;
}

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
  dataSource = new MatTableDataSource<DriverLeaveDisplay>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  showPaginator = false;
  private readonly destroyRef = inject(DestroyRef);
  private dialogRef: any;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly dataShareService: DataShareService,
    private readonly titleCase: TitleCasePipe,
    private readonly matDialog: MatDialog,
    private readonly datePipe: DatePipe,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.matDialog.closeAll();
      }
    });

    this.getDriverAppliedLeaves();
  }

  ngAfterViewChecked(): void {
    if (this.showPaginator && !this.dataSource.paginator) {
      this.dataSource.paginator = this.paginator;
    } else if (!this.showPaginator && this.dataSource.paginator) {
      this.dataSource.paginator = null;
    }
  }

  getDriverAppliedLeaves(): void {
    this.firebaseService.getDriverAppliedLeaves().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (res: DriverLeave[]) => {
        const response: DriverLeaveDisplay[] = res
          .filter(leave => !leave.isLeaveCancelled)
          .map((item, index) => ({
            ...item,
            position: index + 1
          }));

        this.dataSource.data = response;
        this.showPaginator = response.length > 5;
      },
      (error) => {
        console.error('Error fetching driver applied leaves:', error);
      }
    );
  }

  toViewLeave(element: DriverLeaveDisplay): void {
    this.matDialog.closeAll();

    const startDate = this.datePipe.transform(element.leaveStartDate, 'longDate');
    const endDate = this.datePipe.transform(element.leaveEndDate, 'longDate');

    const data = [
      { key: 'Driver Name', value: this.titleCase.transform(element.driverName) },
      { key: 'Driver Mobile Number', value: `+91-${element.driverMobileNumber || ''}` },
      { key: 'Leave Reason', value: this.titleCase.transform(element.leaveReason) },
      { key: 'Leave Type', value: element?.leaveType === 'FULL' ? 'Full Day' : 'Half Day' },
      { key: 'No: Of Days Leave', value: element.numberOfDays },
      { key: 'Driver Type', value: this.titleCase.transform(element.driverType || '') },
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

  toCancelLeave(element: DriverLeaveDisplay): void {
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
        heading: 'Are you sure?',
        content: `Are you sure you want to cancel Savaari Driver <strong> ${driverName} 's </strong> leave from <br> <strong> ${startDate} </strong> to <strong> ${endDate} </strong> `,
        buttons: ['Cancel Leave', "Don't Cancel"],
        onButtonClick: (e: string) => {
          if (e === 'Cancel Leave' && element.docId) {
            this.dialogRef.close();
            const params = {
              isLeaveCancelled: true,
              leaveCancelledAt: new Date(),
              cancelledBy: 'ADMIN',
              docId: element.docId
            };
            this.firebaseService.updateLeaveStatus(params as any);
          } else {
            this.dialogRef.close();
          }
        }
      }
    });
  }

  toEditLeave(element: DriverLeaveDisplay): void {
    this.dataShareService.updateData(element);
    this.router.navigate(['applyDriverLeave']);
  }
}
