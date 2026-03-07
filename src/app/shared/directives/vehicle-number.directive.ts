import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appVehicleNumber]',
  standalone: true
})
export class VehicleNumberDirective {
  private readonly PREFIX = 'KL-';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('focus') onFocus() {
    const value = this.el.nativeElement.value;
    if (!value.startsWith(this.PREFIX)) {
      this.renderer.setProperty(this.el.nativeElement, 'value', this.PREFIX);
      this.setCursorToEnd();
    }
  }

  @HostListener('blur') onBlur() {
    const value = this.el.nativeElement.value;
    const formattedValue = this.formatVehicleNumber(value);
    this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue);
  }

  private formatVehicleNumber(value: string): string {
    // Remove unwanted characters and ensure upper case
    let cleanedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Extract parts
    const regionCode = cleanedValue.substring(2, 4); // Next 2 digits after 'KL-'
    const typeCode = cleanedValue.charAt(4); // Single letter after region code
    const numberCode = cleanedValue.substring(5); // Rest as the number

    // Ensure correct format
    return `${this.PREFIX}${regionCode}-${typeCode}-${numberCode}`;
  }

  private setCursorToEnd() {
    const inputElement = this.el.nativeElement;
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
  }
}
