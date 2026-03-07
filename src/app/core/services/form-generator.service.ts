import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FormFieldConfig, FormFieldValidator, FormSectionConfig, FormConfig } from '../models/form-field.model';

@Injectable({
    providedIn: 'root'
})
export class FormGeneratorService {
    constructor(private fb: FormBuilder) { }

    /**
     * Generates a FormGroup from FormConfig or FormSectionConfig[]
     */
    generateForm(config: FormConfig | FormSectionConfig[] | FormFieldConfig[]): FormGroup {
        const group: any = {};

        if (Array.isArray(config)) {
            // Check if it's sections or flat fields
            if (config.length > 0 && 'formFieldConfig' in config[0]) {
                (config as FormSectionConfig[]).forEach(section => {
                    this.processFields(section.formFieldConfig, group);
                });
            } else {
                this.processFields(config as FormFieldConfig[], group);
            }
        } else if ('formSectionConfig' in config) {
            config.formSectionConfig.forEach(section => {
                this.processFields(section.formFieldConfig, group);
            });
        }

        return this.fb.group(group);
    }

    private processFields(fields: FormFieldConfig[], group: any): void {
        fields.forEach((field) => {
            const validators = this.mapValidators(field.validators || []);
            if (field.mandatory) {
                validators.push(Validators.required);
            }
            if (field.formatType === 'VehicleNumber') {
                // Indian Vehicle Number format: XX 00 XX 0000
                validators.push(Validators.pattern(/^[A-Z]{2}\s[0-9]{2}\s[A-Z]{1,2}\s[0-9]{4}$/));
            }
            group[field.fieldID] = [field.value || field.defaultValue || '', validators];
        });
    }

    private mapValidators(validators: FormFieldValidator[]): ValidatorFn[] {
        const formValidators: ValidatorFn[] = [];

        validators.forEach((v) => {
            switch (v.name.toLowerCase()) {
                case 'required':
                    formValidators.push(Validators.required);
                    break;
                case 'email':
                    formValidators.push(Validators.email);
                    break;
                case 'minlength':
                    formValidators.push(Validators.minLength(v.args));
                    break;
                case 'maxlength':
                    formValidators.push(Validators.maxLength(v.args));
                    break;
                case 'pattern':
                    formValidators.push(Validators.pattern(v.args));
                    break;
                // Add more validators as needed
            }
        });

        return formValidators;
    }
}
