import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-element-detailed-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './element-detailed-view.component.html',
  styleUrls: ['./element-detailed-view.component.scss']
})
export class ElementDetailedViewComponent implements OnInit {
  details: DetailsList[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: any,
    private readonly matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.details = this.data.data || [];
  }

  edit() {
    this.data.edit();
  }

  delete() {
    this.data.delete();
  }

  close() {
    this.matDialog.closeAll();
  }
}

export interface DetailsList {
  key: string;
  value: string;
}
