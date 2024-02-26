import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-element-detailed-view',
  templateUrl: './element-detailed-view.component.html',
  styleUrls: ['./element-detailed-view.component.scss']
})
export class ElementDetailedViewComponent implements OnInit {
  displayedColumns: string[] = ['key', 'value'];
  dataSource = new MatTableDataSource<DetailsList>([]);

  constructor( @Inject(MAT_DIALOG_DATA) public data: any ) {}

  ngOnInit(): void {
    this.dataSource.data = this.data.data
  }

  edit() {
    this.data.edit();
  }

  delete() {
    this.data.delete();
  }

}

export interface DetailsList {
  key: string,
  value: string
}