import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface DriverOtp {
  type: string;
  otp: string | number;
  driverName?: string;
}

@Component({
  selector: 'app-list-all-drivers',
  templateUrl: './list-all-drivers.component.html',
  styleUrls: ['./list-all-drivers.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, FormsModule]
})
export class ListAllDriversComponent implements OnInit {
  filteredDrivers: DriverOtp[] = [];
  searchQuery: string = '';
  drivers: DriverOtp[] = [];

  constructor(
    private readonly dialogRef: MatDialogRef<ListAllDriversComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { drivers: DriverOtp[] }
  ) {
    this.drivers = data.drivers || [];
  }

  ngOnInit(): void {
    this.filteredDrivers = this.drivers;
  }

  closeDialog(driverDetails: DriverOtp): void {
    this.dialogRef.close(driverDetails);
  }

  searchDrivers(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDrivers = this.drivers.filter((driver) => {
      const typeStr = (driver.type || '').toLowerCase();
      const otpStr = (driver.otp || '').toString().toLowerCase();
      const nameStr = (driver.driverName || '').toLowerCase();
      return typeStr.includes(query) || otpStr.includes(query) || nameStr.includes(query);
    });
  }
}
