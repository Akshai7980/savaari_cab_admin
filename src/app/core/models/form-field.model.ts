export interface FormFieldValidator {
    name: string;
    args?: any;
    message?: string;
}

export interface FormFieldOption {
    label: string;
    value: any;
}

export interface FormFieldConfig {
    fieldID: string;
    fieldLabel: string;
    controlType: 'TextBox' | 'Dropdown' | 'Radio' | 'Checkbox' | 'TextArea' | 'Date' | 'Number' | string;
    type?: string;
    colspan?: number;
    mandatory?: boolean;
    options?: FormFieldOption[];
    validators?: FormFieldValidator[];
    placeholder?: string;
    hideOnLoad?: boolean;
    disable?: boolean;
    dataSourceKey?: string;
    dependsOn?: string;
    dataPath?: string;
    defaultValue?: any;
    value?: any;
    hint?: string;
    formatType?: 'VehicleNumber' | string;
    autoCapitalize?: boolean;
    prefixIcon?: string;
    prefixText?: string;
    showCounter?: boolean;
    maxLength?: number;
    infoTooltip?: string;
}

export interface FormSectionConfig {
    sectionID: string;
    sectionLabel?: string;
    sectionLayout: number; // e.g., 3 for 3-column grid
    formFieldConfig: FormFieldConfig[];
    hideOnLoad?: boolean;
}

export interface FormConfig {
    formID: string;
    formTitle: string;
    infoTooltip?: string;
    formLayout?: number;
    formSectionConfig: FormSectionConfig[];
}
