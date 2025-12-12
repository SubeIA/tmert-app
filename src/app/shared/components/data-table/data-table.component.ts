import { Component, input, output, effect, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => string | number;
  cellClass?: string | ((row: T) => string);
}

export interface TableAction<T = Record<string, unknown>> {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  show?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  handler: (row: T) => void;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T = Record<string, unknown>> implements AfterViewInit {
  // Inputs
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  actions = input<TableAction<T>[]>([]);
  loading = input<boolean>(false);
  emptyMessage = input<string>('No hay datos disponibles');
  showActions = input<boolean>(true);
  actionsWidth = input<string>('120px');
  stickyHeader = input<boolean>(false);
  striped = input<boolean>(true);
  hoverable = input<boolean>(true);

  // Pagination inputs
  showPagination = input<boolean>(true);
  pageSize = input<number>(10);
  pageSizeOptions = input<number[]>([5, 10, 25, 50, 100]);
  showFirstLastButtons = input<boolean>(true);

  // Index column
  showIndex = input<boolean>(false);
  indexHeader = input<string>('#');

  // Outputs
  rowClick = output<T>();

  // ViewChild
  paginator = viewChild<MatPaginator>(MatPaginator);

  // DataSource
  dataSource = new MatTableDataSource<T>([]);

  constructor() {
    // Update dataSource when data changes
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    const paginatorInstance = this.paginator();
    if (paginatorInstance) {
      this.dataSource.paginator = paginatorInstance;
    }
  }

  // Get displayed columns including index and actions
  getDisplayedColumns(): string[] {
    const cols: string[] = [];

    // Add index column first if enabled
    if (this.showIndex()) {
      cols.push('index');
    }

    // Add data columns
    cols.push(...this.columns().map(col => col.key));

    // Add actions column last if enabled
    if (this.showActions() && this.actions().length > 0) {
      cols.push('actions');
    }

    return cols;
  }

  // Get column definition
  getColumn(key: string): TableColumn<T> | undefined {
    return this.columns().find(col => col.key === key);
  }

  // Get cell value
  getCellValue(row: T, column: TableColumn<T>): string | number {
    if (column.render) {
      return column.render(row);
    }
    const value = (row as Record<string, unknown>)[column.key];
    return typeof value === 'string' || typeof value === 'number' ? value : '';
  }

  // Get cell class
  getCellClass(row: T, column: TableColumn<T>): string {
    if (typeof column.cellClass === 'function') {
      return column.cellClass(row);
    }
    return column.cellClass || '';
  }

  // Check if action should be shown
  shouldShowAction(action: TableAction<T>, row: T): boolean {
    return action.show ? action.show(row) : true;
  }

  // Check if action is disabled
  isActionDisabled(action: TableAction<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  // Handle action click
  onActionClick(action: TableAction<T>, row: T, event: Event): void {
    event.stopPropagation();
    if (!this.isActionDisabled(action, row)) {
      action.handler(row);
    }
  }

  // Get row index considering pagination
  getRowIndex(index: number): number {
    const paginatorInstance = this.paginator();
    if (paginatorInstance && this.showPagination()) {
      return paginatorInstance.pageIndex * paginatorInstance.pageSize + index + 1;
    }
    return index + 1;
  }

  // Handle row click
  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }
}
