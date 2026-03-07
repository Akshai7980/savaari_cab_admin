import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface AlertData {
  icon?: string;
  image?: string;
  heading?: string;
  content?: string;
  popupType?: 'FORM-SUBMIT' | string;
  buttons?: string | string[];
  alertType?: 'SUCCESS' | string;
  onButtonClick: (label: string) => void;
}

@Component({
  selector: 'app-alert-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './alert-popup.component.html',
  styleUrls: ['./alert-popup.component.scss']
})
export class AlertPopupComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: AlertData,
    private readonly matDialog: MatDialog
  ) { }

  onButtonClick(label: string | string[]): void {
    const finalLabel = Array.isArray(label) ? label.join(', ') : label;
    if (this.data.onButtonClick) {
      this.data.onButtonClick(finalLabel);
    }
  }

  closeAlert(): void {
    this.matDialog.closeAll();
  }
}
