import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FirebaseService } from '../../../core/services/firebase.service';
import { UtilityService } from '../../../core/services/utility.service';
import { DataShareService } from '../../../core/services/data-share.service';
import { TableConfig } from '../../../core/models/table-config.model';
import { DriverLeave } from '../../../core/models/leave.model';
import { DynamicSummaryTableComponent } from '../../../shared/components/dynamic-summary-table/dynamic-summary-table.component';
import { FormLoaderComponent } from '../../../shared/components/form-loader/form-loader.component';
import { ElementDetailedViewComponent } from '../../../shared/components/element-detailed-view/element-detailed-view.component';
import { AlertPopupComponent } from '../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'list-driver-leave',
  standalone: true,
  imports: [
    CommonModule,
    DynamicSummaryTableComponent,
    FormLoaderComponent
  ],
  templateUrl: './list-driver-leave.component.html',
  styleUrls: ['./list-driver-leave.component.scss'],
  providers: [DatePipe, TitleCasePipe]
})
export default class ListDriverLeaveComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private utilityService = inject(UtilityService);
  private dataShareService = inject(DataShareService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private datePipe = inject(DatePipe);
  private titleCasePipe = inject(TitleCasePipe);

  tableConfig!: TableConfig;
  leaveData: DriverLeave[] = [];
  isLoading = signal<boolean>(true);

  private dialogRef: any;

  ngOnInit(): void {
    this.loadTableConfig();
    this.getDriverAppliedLeaves();
  }

  loadTableConfig() {
    this.utilityService.getJSON('assets/configs/list-driver-leave.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: any) => {
        this.tableConfig = data as TableConfig;
      });
  }

  getDriverAppliedLeaves() {
    this.firebaseService.getDriverAppliedLeaves()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (res: DriverLeave[]) => {
          this.leaveData = res
            .filter(leave => !leave.isLeaveCancelled)
            .map((item, index) => ({
              ...item,
              position: index + 1
            }));
          this.isLoading.set(false);
        },
        (error) => {
          console.error('Error fetching driver applied leaves:', error);
          this.isLoading.set(false);
        }
      );
  }

  onTableAction(event: { actionID: string; row: DriverLeave }) {
    switch (event.actionID) {
      case 'view':
        this.toViewLeave(event.row);
        break;
      case 'cancel':
        this.toCancelLeave(event.row);
        break;
      case 'edit':
        this.toEditLeave(event.row);
        break;
    }
  }

  toViewLeave(element: DriverLeave): void {
    this.dialog.closeAll();

    const startDate = this.datePipe.transform(element.leaveStartDate, 'longDate');
    const endDate = this.datePipe.transform(element.leaveEndDate, 'longDate');

    const data = [
      { key: 'Driver Name', value: this.titleCasePipe.transform(element.driverName) },
      { key: 'Driver Mobile Number', value: `+91-${element.driverMobileNumber || ''}` },
      { key: 'Leave Reason', value: this.titleCasePipe.transform(element.leaveReason) },
      { key: 'Leave Type', value: element?.leaveType === 'FULL' ? 'Full Day' : 'Half Day' },
      { key: 'No: Of Days Leave', value: element.numberOfDays },
      { key: 'Driver Type', value: this.titleCasePipe.transform(element.driverType || '') },
      { key: 'Leave Start Date', value: startDate },
      { key: 'Leave End Date', value: endDate }
    ];

    this.dialogRef = this.dialog.open(ElementDetailedViewComponent, {
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

  toCancelLeave(element: DriverLeave): void {
    const startDate = this.datePipe.transform(element.leaveStartDate, 'longDate');
    const endDate = this.datePipe.transform(element.leaveEndDate, 'longDate');
    const driverName = this.titleCasePipe.transform(element.driverName);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.height = '400px';
    dialogConfig.width = '600px';

    this.dialogRef = this.dialog.open(AlertPopupComponent, {
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

  toEditLeave(element: DriverLeave): void {
    this.dataShareService.updateData(element);
    this.router.navigate(['applyDriverLeave']);
  }
}
