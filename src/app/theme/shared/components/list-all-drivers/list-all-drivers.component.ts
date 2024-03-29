import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-list-all-drivers',
  templateUrl: './list-all-drivers.component.html',
  styleUrls: ['./list-all-drivers.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, FormsModule]
})
export class ListAllDriversComponent implements OnInit {
  allDrivers: any[] = [];
  filteredDrivers: any[] = [];
  searchQuery: string = '';
  drivers: Driver[];

  constructor(
    private readonly dialogRef: MatDialogRef<ListAllDriversComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: any
  ) {
    this.drivers = data.drivers;
    console.log(this.drivers);
  }

  ngOnInit(): void {
    this.filteredDrivers = this.drivers;
  }

  closeDialog(driverDetails: Driver) {
    this.dialogRef.close(driverDetails);
  }

  searchDrivers(event: Event) {
    const searchQuery = (event.target as HTMLInputElement).value.toLowerCase();

    // Filter drivers based on the search query
    this.filteredDrivers = this.allDrivers.filter((driver) => {
      // Customize this condition based on your search criteria
      // Here, it searches for drivers whose "type" or "otp" contains the search query
      return driver.type.toLowerCase().includes(searchQuery) || driver.otp > toString().toLowerCase().includes(searchQuery);
    });
  }
}

export interface Driver {
  type: '';
  otp: '';
}
