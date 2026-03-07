import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldConfig } from 'src/app/core/models/form-field.model';

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

    ngOnInit(): void {
        if (!this.formGroup) {
            console.error('DynamicFormComponent: formGroup is required.');
        }
    }

    get control() {
        return this.formGroup.get(this.config.fieldID);
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

            return validator?.message || `Invalid ${this.config.fieldLabel}`;
        }
        return null;
    }

    onBlur() {
        if (this.config.formatType === 'VehicleNumber' && this.control?.value) {
            const formatted = this.formatVehicleNumber(this.control.value);
            this.control.setValue(formatted, { emitEvent: false });
        }
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
}
