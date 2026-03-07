import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[autocapitalize]',
  standalone: true
})
export class AutocapitalizeDirective {
  @Input() autocapitalize: 'none' | 'sentences' | 'words' | 'characters' = 'none';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = this.el.nativeElement;
    if (this.autocapitalize === 'words') {
      input.value = this.capitalizeWords(input.value);
    } else if (this.autocapitalize === 'characters') {
      input.value = input.value.toUpperCase();
    }
  }

  private capitalizeWords(value: string): string {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
