import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-list-all-drivers',
  templateUrl: './list-all-drivers.component.html',
  styleUrls: ['./list-all-drivers.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ListAllDriversComponent {
  constructor(private dialogRef: MatDialogRef<ListAllDriversComponent>) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
