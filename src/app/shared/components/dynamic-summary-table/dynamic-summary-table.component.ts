import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableConfig, TableColumnConfig, CellTransform, TableActionConfig } from '../../../core/models/table-config.model';
import { NoDataFoundComponent } from '../no-data-found/no-data-found.component';

@Component({
    selector: 'app-dynamic-summary-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        NoDataFoundComponent
    ],
    templateUrl: './dynamic-summary-table.component.html',
    styleUrls: ['./dynamic-summary-table.component.scss'],
    providers: [TitleCasePipe, DatePipe, CurrencyPipe, DecimalPipe]
})
export class DynamicSummaryTableComponent implements AfterViewInit, OnChanges {
    @Input() config!: TableConfig;
    @Input() data: any[] = [];
    @Output() rowAction = new EventEmitter<{ actionID: string; row: any }>();
    @Output() rowClick = new EventEmitter<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = [];

    constructor(
        private titleCasePipe: TitleCasePipe,
        private datePipe: DatePipe,
        private currencyPipe: CurrencyPipe,
        private decimalPipe: DecimalPipe
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['config'] && this.config) {
            this.displayedColumns = this.config.columns.map(c => c.columnID);
            if (this.config.actions && this.config.actions.length > 0) {
                this.displayedColumns.push('actions');
            }
        }

        if (changes['data'] && this.data) {
            this.dataSource.data = this.data;
        }
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    getCellValue(row: any, column: TableColumnConfig): string {
        if (column.isIndex) {
            const index = this.data.indexOf(row);
            return String(index + 1);
        }

        let value = row[column.columnID];

        if (value === null || value === undefined || value === '') {
            return column.transform?.fallback || '--';
        }

        if (column.transform) {
            value = this.applyTransform(value, column.transform);
        }

        return String(value);
    }

    private applyTransform(value: any, transform: CellTransform): any {
        // Apply value map first (e.g., 'FULL' → 'Full Day')
        if (transform.valueMap && transform.valueMap[value] !== undefined) {
            value = transform.valueMap[value];
        }

        // Apply Angular pipe
        if (transform.pipe) {
            switch (transform.pipe) {
                case 'titlecase':
                    value = this.titleCasePipe.transform(String(value));
                    break;
                case 'date':
                    value = this.datePipe.transform(value, transform.pipeArgs || 'mediumDate');
                    break;
                case 'currency':
                    value = this.currencyPipe.transform(value, transform.pipeArgs || 'INR');
                    break;
                case 'number':
                    value = this.decimalPipe.transform(value, transform.pipeArgs);
                    break;
            }
        }

        // Apply prefix/suffix
        if (transform.prefix) {
            value = transform.prefix + value;
        }
        if (transform.suffix) {
            value = value + transform.suffix;
        }

        return value;
    }

    onAction(actionID: string, row: any): void {
        this.rowAction.emit({ actionID, row });
    }

    onRowClick(row: any): void {
        this.rowClick.emit(row);
    }

    get showPaginator(): boolean {
        if (!this.config) return false;
        const paginateAfter = this.config.paginateAfter || 5;
        return this.data.length > paginateAfter;
    }

    get pageSizeOptions(): number[] {
        return this.config?.pageSizeOptions || [5, 10, 20];
    }

    get defaultPageSize(): number {
        return this.config?.defaultPageSize || 5;
    }

    getActionVariantClass(action: TableActionConfig): string {
        switch (action.variant) {
            case 'primary': return 'btn-action-primary';
            case 'danger': return 'btn-action-danger';
            case 'warning': return 'btn-action-warning';
            default: return 'btn-action-secondary';
        }
    }
}
