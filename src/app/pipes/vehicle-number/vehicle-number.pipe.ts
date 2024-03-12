import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vehicleNumber',
  standalone: true
})
export class VehicleNumberPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Split the value into parts
    const parts = value.match(/[A-Za-z]+|\d+/g);

    if (!parts || parts.length < 2) {
      return value;
    }

    // Insert spaces between parts
    const spacedValue = parts.join(' ');

    return spacedValue;
  }
}
