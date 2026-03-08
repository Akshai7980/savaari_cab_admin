import { Component, Input, Output, EventEmitter, OnInit, inject, ElementRef, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldConfig } from '../../../core/models/form-field.model';
import { UtilityService } from '../../../core/services/utility.service';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerManagerService } from '../../../core/services/picker-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dynamic-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule
    ],
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {
    @ViewChild('picker') picker!: MatDatepicker<any>;
    @Input() config!: FormFieldConfig;
    @Input() formGroup!: FormGroup;
    @Output() fieldClick = new EventEmitter<{ fieldID: string; config: FormFieldConfig }>();

    private utilityService = inject(UtilityService);
    private pickerService = inject(PickerManagerService);
    private elementRef = inject(ElementRef);

    private subscriptions = new Subscription();

    isDropdownOpen = false;
    searchTerm = '';
    filteredOptions: any[] = [];

    ngOnInit(): void {
        this.initializeComponent();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private initializeComponent(): void {
        if (!this.formGroup) {
            console.error('DynamicFormComponent: formGroup is required.');
            return;
        }

        if (this.config.options) {
            this.filteredOptions = [...this.config.options];
        }

        this.initializeFormState();
        this.loadInitialData();
        this.setupSubscriptions();
    }

    private initializeFormState(): void {
        if (this.config.disable) {
            this.control?.disable({ emitEvent: false });
        }
        this.setDefaultValues();
    }

    private setDefaultValues(): void {
        if (!this.config.defaultValue || this.control?.value) return;

        const val = this.config.defaultValue;
        const type = this.config.controlType;

        if (type === 'Date' && val === 'CURRENT_DATE') {
            this.control?.setValue(this.getLocalDateString(), { emitEvent: true });
        } else if (this.config.type === 'time' && val.startsWith('CURRENT_TIME')) {
            const offset = val.includes('+') ? parseInt(val.split('+')[1], 10) : 0;
            this.control?.setValue(this.getLocalTimeString(new Date(), offset), { emitEvent: true });
        } else {
            this.control?.setValue(val, { emitEvent: true });
        }
    }

    private loadInitialData(): void {
        if (this.config.dataSourceKey && !this.config.dependsOn) {
            this.loadDataSource(this.config.dataSourceKey);
        }
    }

    private setupSubscriptions(): void {
        // Dependency Handling
        if (this.config.dependsOn) {
            const parent = this.formGroup.get(this.config.dependsOn);
            if (parent) {
                if (!parent.value) this.control?.disable({ emitEvent: false });

                this.subscriptions.add(
                    parent.valueChanges.subscribe(val => this.handleDependencies(val))
                );

                if (parent.value) this.handleDependencies(parent.value);
            }
        }

        // Singleton Picker Handling
        if (this.config.controlType === 'Date') {
            this.subscriptions.add(
                this.pickerService.activePickerId$.subscribe(id => {
                    if (id !== this.config.fieldID && this.picker?.opened) {
                        this.picker.close();
                    }
                })
            );
        }
    }

    private handleDependencies(parentValue: any): void {
        if (parentValue) {
            this.control?.enable({ emitEvent: false });
            this.handleDateDependency(parentValue);
            if (this.config.dataSourceKey) {
                this.loadDataSource(this.config.dataSourceKey, parentValue);
            }
        } else {
            this.control?.disable({ emitEvent: false });
            if (this.config.controlType === 'Dropdown') {
                this.updateFilteredOptions([{ label: this.config.placeholder || 'Select Option', value: '' }]);
            }
            this.control?.setValue('', { emitEvent: false });
        }
    }

    private handleDateDependency(parentValue: string): void {
        if (this.config.controlType !== 'Date') return;
        const current = this.control?.value;
        if (current && current < parentValue) {
            this.control?.setValue('', { emitEvent: false });
            this.control?.markAsUntouched();
        }
    }

    private loadDataSource(key: string, parentValue?: any): void {
        this.utilityService.getJSON(`assets/configs/${key}.json`).subscribe({
            next: (data) => {
                if (parentValue && data && typeof data === 'object' && !Array.isArray(data)) {
                    this.updateFilteredOptions(data[parentValue] || [{ label: this.config.placeholder || 'Select Option', value: '' }]);
                } else {
                    this.updateFilteredOptions(data);
                }
            },
            error: (err) => console.error(`Failed to load dataSourceKey: ${key}`, err)
        });
    }

    get control() {
        return this.formGroup.get(this.config.fieldID);
    }

    // Helper: Date string YYYY-MM-DD
    private getLocalDateString(date: Date = new Date()): string {
        return date.toISOString().split('T')[0];
    }

    // Helper: Time string HH:mm with optional minute offset
    private getLocalTimeString(date: Date = new Date(), offsetMins: number = 0): string {
        if (offsetMins) date.setMinutes(date.getMinutes() + offsetMins);
        return date.toTimeString().slice(0, 5);
    }

    onDateChange(event: any): void {
        const val = event.value ? this.getLocalDateString(event.value) : '';
        this.control?.setValue(val, { emitEvent: true });
        if (val) this.control?.markAsDirty();
        this.control?.markAsTouched();
        this.control?.updateValueAndValidity();
    }

    get minDate(): string | null {
        if (this.config.minDate === 'CURRENT_DATE') return this.getLocalDateString();
        if (this.config.dependsOn && this.config.controlType === 'Date') {
            return this.formGroup.get(this.config.dependsOn)?.value || this.getLocalDateString();
        }
        return this.config.minDate || null;
    }

    get maxDate(): string | null {
        if (!this.config.maxDate) return null;
        if (this.config.maxDate === 'CURRENT_DATE') return this.getLocalDateString();
        if (this.config.maxDate.startsWith('CURRENT_DATE+')) {
            const days = parseInt(this.config.maxDate.split('+')[1], 10);
            const date = new Date();
            date.setDate(date.getDate() + days);
            return this.getLocalDateString(date);
        }
        return this.config.maxDate;
    }

    get minDateAsDate(): Date | null {
        return this.parseDateString(this.minDate, 0);
    }

    get maxDateAsDate(): Date | null {
        return this.parseDateString(this.maxDate, 23, 59, 59, 999);
    }

    private parseDateString(ds: string | null, h: number, m: number = 0, s: number = 0, ms: number = 0): Date | null {
        if (!ds) return null;
        const [y, mm, d] = ds.split('-').map(v => parseInt(v, 10));
        return new Date(y, mm - 1, d, h, m, s, ms);
    }

    get isValid() {
        return this.control?.valid;
    }

    getError(): string | null {
        if (!this.control?.touched || !this.control?.errors) return null;
        const key = Object.keys(this.control.errors)[0];

        if (key === 'required') return `${this.config.fieldLabel} is required`;

        if (key === 'pattern') {
            if (this.config.formatType === 'VehicleNumber') return `Invalid format. Expected: KL 07 AB 1234`;
            if (this.config.formatType === 'DriverLicense') return `Invalid format. Expected: DL-01 20110012345`;
        }

        const validator = this.config.validators?.find(v => v.name.toLowerCase() === key.toLowerCase());
        return validator?.message || `Invalid ${this.config.fieldLabel}`;
    }

    onBlur(): void {
        const val = this.control?.value;
        if (!val) return;

        if (this.config.formatType === 'VehicleNumber') {
            this.control?.setValue(this.formatVehicleNumber(val), { emitEvent: false });
        } else if (this.config.formatType === 'DriverLicense') {
            this.control?.setValue(this.formatDriverLicense(val), { emitEvent: false });
            this.control?.markAsTouched();
            this.control?.updateValueAndValidity({ emitEvent: false });
        }
    }

    onInput(event: any): void {
        if (!this.config.autoCapitalize) return;
        const input = event.target as HTMLInputElement;
        const { selectionStart: start, selectionEnd: end } = input;
        input.value = input.value.replace(/\b\w/g, c => c.toUpperCase());
        input.setSelectionRange(start, end);
        this.control?.setValue(input.value, { emitEvent: false });
    }

    onFieldClick(): void {
        this.fieldClick.emit({ fieldID: this.config.fieldID, config: this.config });
    }

    onNumberKeyPress(event: KeyboardEvent): boolean {
        const code = event.which || event.keyCode;
        if (code < 48 || code > 57) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    private formatVehicleNumber(value: string): string {
        const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (clean.length < 2) return clean;

        const state = clean.substring(0, 2);
        const district = clean.substring(2, 4);
        const remainder = clean.substring(4);
        const seriesMatch = remainder.match(/^[A-Z]{0,2}/);
        const series = seriesMatch ? seriesMatch[0] : '';
        const id = remainder.substring(series.length).substring(0, 4);

        return [state, district, series, id].filter(Boolean).join(' ');
    }

    private formatDriverLicense(value: string): string {
        const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (clean.length < 2) return clean;

        const state = clean.substring(0, 2);
        const rto = clean.substring(2, 4);
        const remain = clean.substring(4, 15);

        let res = state;
        if (rto) res += '-' + rto;
        if (remain) res += ' ' + remain;
        return res;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.isDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
            this.isDropdownOpen = false;
            this.control?.markAsTouched();
        }
    }

    openDatePicker(): void {
        if (this.control?.disabled) return;
        this.pickerService.openPicker(this.config.fieldID || '');
        this.picker.open();
    }

    private updateFilteredOptions(options: any[]): void {
        this.config.options = options;
        this.filteredOptions = [...options];
    }

    onSearchChange(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredOptions = (this.config.options || []).filter(opt =>
            opt.label.toLowerCase().includes(this.searchTerm)
        );
    }

    toggleDropdown(event: Event): void {
        if (this.control?.disabled) return;
        event.preventDefault();
        this.isDropdownOpen = !this.isDropdownOpen;
        if (this.isDropdownOpen) {
            this.searchTerm = '';
            this.filteredOptions = [...(this.config.options || [])];
        } else {
            this.control?.markAsTouched();
        }
    }

    selectOption(value: any): void {
        if (this.control?.disabled) return;
        this.control?.setValue(value, { emitEvent: true });
        this.isDropdownOpen = false;
        this.control?.markAsTouched();
        this.control?.updateValueAndValidity();
    }

    getSelectedLabel(): string | null {
        const val = this.control?.value;
        if (val === null || val === undefined || val === '') return null;
        return this.config.options?.find(opt => opt.value === val)?.label || val;
    }
}
