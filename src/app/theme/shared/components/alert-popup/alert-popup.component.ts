import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-popup',
  templateUrl: './alert-popup.component.html',
  styleUrls: ['./alert-popup.component.scss']
})
export class AlertPopupComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: any,
    private readonly matDialog: MatDialog
  ) {
    console.log('data:', data);
  }

  onButtonClick(label: string) {
    console.log(label);
    this.data.onButtonClick(label);
  }

  closeAlert() {
    this.matDialog.closeAll();
  }
}
