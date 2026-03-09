/**
 * Configuration model for the Dynamic Summary Table component.
 * Mirrors the pattern of FormFieldConfig / FormConfig but for data tables.
 */

/** Defines how a cell value should be transformed for display */
export interface CellTransform {
    /** Angular pipe name: 'titlecase', 'date', 'currency', 'number' */
    pipe?: string;
    /** Pipe arguments (e.g., 'longDate' for DatePipe) */
    pipeArgs?: string;
    /** Map raw values to display labels (e.g., { 'FULL': 'Full Day', 'HALF': 'Half Day' }) */
    valueMap?: Record<string, string>;
    /** Prefix to prepend (e.g., '+91-') */
    prefix?: string;
    /** Suffix to append */
    suffix?: string;
    /** Fallback value when cell is null/undefined/empty */
    fallback?: string;
}

/** Defines a single column in the summary table */
export interface TableColumnConfig {
    /** Unique column identifier matching the data property name */
    columnID: string;
    /** Display header label */
    headerLabel: string;
    /** Optional cell transform for display formatting */
    transform?: CellTransform;
    /** Whether this is a positional index column (auto-numbered) */
    isIndex?: boolean;
    /** Column width hint (e.g., '80px', '20%') */
    width?: string;
    /** Text alignment: 'left' | 'center' | 'right' */
    align?: string;
}

/** Defines an action button in the actions column */
export interface TableActionConfig {
    /** Action identifier emitted on click */
    actionID: string;
    /** Button display label */
    label: string;
    /** Icon class (e.g., 'ti ti-eye') */
    icon?: string;
    /** Button style variant: 'primary' | 'secondary' | 'danger' | 'warning' */
    variant?: string;
}

/** Root config for the dynamic summary table */
export interface TableConfig {
    /** Unique table identifier */
    tableID: string;
    /** Title displayed above the table */
    tableTitle: string;
    /** Column definitions */
    columns: TableColumnConfig[];
    /** Action buttons per row */
    actions?: TableActionConfig[];
    /** Page size options for the paginator */
    pageSizeOptions?: number[];
    /** Default page size */
    defaultPageSize?: number;
    /** Whether to show the search/filter bar */
    showFilter?: boolean;
    /** Minimum rows before showing pagination */
    paginateAfter?: number;
}
