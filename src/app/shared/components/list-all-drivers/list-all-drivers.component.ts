import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Driver } from '../../../core/models/driver.model';

@Component({
  selector: 'app-list-all-drivers',
  templateUrl: './list-all-drivers.component.html',
  styleUrls: ['./list-all-drivers.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, FormsModule]
})
export class ListAllDriversComponent implements OnInit {
  filteredDrivers: Driver[] = [];
  searchQuery: string = '';
  drivers: Driver[] = [];

  constructor(
    private readonly dialogRef: MatDialogRef<ListAllDriversComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { drivers: Driver[] }
  ) {
    this.drivers = data.drivers || [];
  }

  ngOnInit(): void {
    this.filteredDrivers = this.drivers;
  }

  closeDialog(driverDetails: Driver | null): void {
    this.dialogRef.close(driverDetails);
  }

  searchDrivers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredDrivers = this.drivers;
      return;
    }

    this.filteredDrivers = this.drivers.filter((driver) => {
      const nameStr = (driver.driverName || '').toLowerCase();
      const numStr = (driver.mobileNumber || '').toLowerCase();
      const codeStr = (driver.driverCode || '').toLowerCase();
      return nameStr.includes(query) || numStr.includes(query) || codeStr.includes(query);
    });
  }
}
