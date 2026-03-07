import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldConfig } from 'src/app/core/models/form-field.model';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
    selector: 'app-dynamic-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
    @Input() config!: FormFieldConfig;
    @Input() formGroup!: FormGroup;

    private utilityService = inject(UtilityService);

    ngOnInit(): void {
        if (!this.formGroup) {
            console.error('DynamicFormComponent: formGroup is required.');
        }

        // Properly disable Reactive Forms control if metadata specifies it
        if (this.config.disable) {
            this.control?.disable({ emitEvent: false });
        }

        if (this.config.dataSourceKey && !this.config.dependsOn) {
            this.utilityService.getJSON(`assets/configs/${this.config.dataSourceKey}.json`)
                .subscribe({
                    next: (data) => {
                        this.config.options = data;
                    },
                    error: (err) => {
                        console.error(`Failed to load dataSourceKey: ${this.config.dataSourceKey}`, err);
                    }
                });
        }

        if (this.config.dependsOn) {
            const parentControl = this.formGroup.get(this.config.dependsOn);
            if (parentControl) {
                // Initialize state
                if (!parentControl.value) {
                    this.control?.disable({ emitEvent: false });
                }

                parentControl.valueChanges.subscribe(parentValue => {
                    if (parentValue) {
                        this.control?.enable({ emitEvent: false });
                        if (this.config.dataSourceKey) {
                            this.utilityService.getJSON(`assets/configs/${this.config.dataSourceKey}.json`)
                                .subscribe({
                                    next: (data) => {
                                        // Specific logic for Object-based data sources (like vehicle-models)
                                        if (data && typeof data === 'object' && !Array.isArray(data)) {
                                            this.config.options = data[parentValue] || [{ label: this.config.placeholder || 'Select Option', value: '' }];
                                        } else {
                                            this.config.options = data;
                                        }
                                        // Reset current selection if parent changes
                                        this.control?.setValue('', { emitEvent: false });
                                    },
                                    error: (err) => {
                                        console.error(`Failed to load dependent dataSourceKey: ${this.config.dataSourceKey}`, err);
                                    }
                                });
                        }
                    } else {
                        // Parent is empty
                        this.control?.disable({ emitEvent: false });
                        this.config.options = [{ label: this.config.placeholder || 'Select Option', value: '' }];
                        this.control?.setValue('', { emitEvent: false });
                    }
                });
            }
        }
    }

    get control() {
        return this.formGroup.get(this.config.fieldID);
    }

    private getLocalDateString(date: Date = new Date()): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    get minDate(): string | null {
        if (this.config.minDate === 'CURRENT_DATE') {
            return this.getLocalDateString();
        }
        return this.config.minDate || null;
    }

    get maxDate(): string | null {
        if (this.config.maxDate?.startsWith('CURRENT_DATE+')) {
            const days = parseInt(this.config.maxDate.split('+')[1], 10);
            const date = new Date();
            date.setDate(date.getDate() + days);
            return this.getLocalDateString(date);
        }
        if (this.config.maxDate === 'CURRENT_DATE') {
            return this.getLocalDateString();
        }
        return this.config.maxDate || null;
    }

    get isValid() {
        return this.control?.valid;
    }

    getError(): string | null {
        if (this.control && this.control.touched && this.control.errors) {
            const firstErrorKey = Object.keys(this.control.errors)[0];
            const validator = this.config.validators?.find(v => v.name.toLowerCase() === firstErrorKey.toLowerCase());

            if (firstErrorKey === 'required') {
                return `${this.config.fieldLabel} is required`;
            }

            if (firstErrorKey === 'pattern' && this.config.formatType === 'VehicleNumber') {
                return `Invalid format. Expected: KL 07 AB 1234`;
            }

            if (firstErrorKey === 'pattern' && this.config.formatType === 'DriverLicense') {
                return `Invalid format. Expected: DL-01 20110012345`;
            }

            return validator?.message || `Invalid ${this.config.fieldLabel}`;
        }
        return null;
    }

    onBlur() {
        if (this.config.formatType === 'VehicleNumber' && this.control?.value) {
            const formatted = this.formatVehicleNumber(this.control.value);
            this.control.setValue(formatted, { emitEvent: false });
        } else if (this.config.formatType === 'DriverLicense' && this.control?.value) {
            const formatted = this.formatDriverLicense(this.control.value);
            this.control.setValue(formatted, { emitEvent: false });
            this.control.markAsTouched();
            this.control.updateValueAndValidity({ emitEvent: false });
        }
    }

    onInput(event: any) {
        if (this.config.autoCapitalize) {
            const input = event.target as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = this.toTitleCase(input.value);
            input.setSelectionRange(start, end);
            this.control?.setValue(input.value, { emitEvent: false });
        }
    }

    onNumberKeyPress(event: KeyboardEvent) {
        const charCode = event.which ? event.which : event.keyCode;
        // Allow only numbers (0-9)
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    private toTitleCase(str: string): string {
        return str.replace(/\b\w/g, (txt) => txt.toUpperCase());
    }

    private formatVehicleNumber(value: string): string {
        // Remove all non-alphanumeric characters and convert to uppercase
        let clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // Standard Indian Format: XX 00 XX 0000 (e.g. KL 07 AB 1234)
        // Groups: 2 chars, 2 digits, 1-2 chars, 4 digits
        if (clean.length >= 2) {
            const state = clean.substring(0, 2);
            let district = '';
            let series = '';
            let uniqueId = '';

            if (clean.length > 2) {
                district = clean.substring(2, 4);
                if (clean.length > 4) {
                    // Check if there are 1 or 2 letters in the series
                    // Usually it's 1 or 2 letters followed by numbers
                    const remainder = clean.substring(4);
                    const lettersMatch = remainder.match(/^[A-Z]+/);
                    const seriesLen = lettersMatch ? lettersMatch[0].length : 0;

                    series = remainder.substring(0, Math.min(seriesLen, 2));
                    uniqueId = remainder.substring(series.length).substring(0, 4);
                }
            }

            let result = state;
            if (district) result += ' ' + district;
            if (series) result += ' ' + series;
            if (uniqueId) result += ' ' + uniqueId;

            return result.trim();
        }

        return clean;
    }

    private formatDriverLicense(value: string): string {
        // Remove non-alphanumeric and uppercase
        const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // Standard Indian DL Format: XX-00 00000000000 (e.g. DL-01 20110012345)
        if (clean.length >= 2) {
            const state = clean.substring(0, 2);
            let rto = '';
            let remainder = '';

            if (clean.length > 2) {
                rto = clean.substring(2, 4);
                if (clean.length > 4) {
                    remainder = clean.substring(4, 15); // year (4) + id (7)
                }
            }

            let result = state;
            if (rto) result += '-' + rto;
            if (remainder) result += ' ' + remainder;

            return result.trim();
        }

        return clean;
    }
}
