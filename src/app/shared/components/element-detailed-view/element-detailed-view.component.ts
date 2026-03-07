import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-element-detailed-view',
  templateUrl: './element-detailed-view.component.html',
  styleUrls: ['./element-detailed-view.component.scss']
})
export class ElementDetailedViewComponent implements OnInit {
  displayedColumns: string[] = ['key', 'value'];
  dataSource = new MatTableDataSource<DetailsList>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: any,
    private readonly matDialog: MatDialog
  ) {
    console.log(data);
  }

  ngOnInit(): void {
    this.dataSource.data = this.data.data;
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
