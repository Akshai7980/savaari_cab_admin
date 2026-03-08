import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormConfig, FormFieldConfig, FormSectionConfig } from 'src/app/core/models/form-field.model';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';

@Component({
    selector: 'app-dynamic-form-container',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
    templateUrl: './dynamic-form-container.component.html',
    styleUrls: ['./dynamic-form-container.component.scss']
})
export class DynamicFormContainerComponent implements OnInit {
    @Input() config!: FormConfig;
    @Input() formGroup!: FormGroup;
    @Output() fieldClick = new EventEmitter<{ fieldID: string; config: FormFieldConfig }>();

    ngOnInit(): void {
        if (!this.formGroup && this.config) {
            console.warn('DynamicFormContainerComponent: formGroup is not initialized yet.');
        }
    }
}
