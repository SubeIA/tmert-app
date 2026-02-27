/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, Input, forwardRef, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EditableTableConfig, TableColumnConfig } from '@shared/models/form-field.model';
import {
  RowEditDialogComponent,
  RowEditDialogData,
  RowEditDialogResult,
} from './row-edit-dialog/row-edit-dialog.component';

@Component({
  selector: 'app-editable-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './editable-table.component.html',
  styleUrl: './editable-table.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableTableComponent),
      multi: true,
    },
  ],
})
export class EditableTableComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private subscription: Subscription | null = null;

  @Input() config!: EditableTableConfig;
  @Input() label = '';

  /** Habilitar chat flotante en el modal de edición */
  @Input() enableChat = false;
  @Input() evaluationId = '';
  @Input() companyId = '';
  @Input() userId = '';

  formArray!: FormArray;
  displayedColumns: string[] = [];
  visibleColumns: TableColumnConfig[] = [];

  // Signal para forzar actualización de la tabla
  tableData = signal<FormGroup[]>([]);

  private onChange: (value: Record<string, unknown>[]) => void = () => {};
  private onTouched: () => void = () => {};
  private initialized = false;
  private pendingValue: Record<string, unknown>[] | null = null;

  ngOnInit(): void {
    this.initializeFormArray();
    this.buildDisplayedColumns();

    // Si hay valores pendientes de writeValue (llamado antes de ngOnInit), aplicarlos
    if (this.pendingValue) {
      this.applyValue(this.pendingValue);
      this.pendingValue = null;
    } else {
      // Inicializar con filas por defecto
      this.ensureDefaultRows();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private initializeFormArray(): void {
    this.formArray = this.fb.array([]);

    // Suscribirse a cambios
    this.subscription = this.formArray.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }

  private ensureDefaultRows(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Agregar filas por defecto solo si no hay filas
    if (this.formArray.length === 0) {
      const defaultRows = this.config.defaultRows || this.config.minRows || 1;
      for (let i = 0; i < defaultRows; i++) {
        this.addRow();
      }
    }
  }

  private applyValue(value: Record<string, unknown>[]): void {
    this.initialized = true;

    // Limpiar filas existentes
    while (this.formArray.length) {
      this.formArray.removeAt(0);
    }

    // Agregar las filas con los datos
    value.forEach(row => {
      const rowGroup = this.createRowGroup();
      rowGroup.patchValue(row);
      this.formArray.push(rowGroup);
    });

    this.updateTableData();
  }

  private buildDisplayedColumns(): void {
    this.displayedColumns = [];
    this.visibleColumns = [];

    if (this.config.showRowNumbers !== false) {
      this.displayedColumns.push('rowNumber');
    }

    // Si useModal está habilitado, solo mostrar columnas marcadas como showInTable
    if (this.config.useModal) {
      this.visibleColumns = this.config.columns.filter(col => col.showInTable === true);
      this.displayedColumns.push(...this.visibleColumns.map(col => col.name));
      // Siempre agregar columna de acciones en modo modal
      this.displayedColumns.push('actions');
    } else {
      this.visibleColumns = this.config.columns;
      this.displayedColumns.push(...this.config.columns.map(col => col.name));
      if (this.config.allowDeleteRow !== false) {
        this.displayedColumns.push('actions');
      }
    }
  }

  private createRowGroup(): FormGroup {
    const group: Record<string, unknown[]> = {};

    this.config.columns.forEach(column => {
      const validators = column.required ? [Validators.required] : [];

      let defaultValue: unknown = '';
      if (column.type === 'number') {
        defaultValue = null;
      } else if (column.type === 'checkbox') {
        defaultValue = false;
      }

      group[column.name] = [defaultValue, validators];
    });

    return this.fb.group(group);
  }

  private updateTableData(): void {
    this.tableData.set([...this.formArray.controls] as FormGroup[]);
  }

  addRow(): void {
    const maxRows = this.config.maxRows;
    if (maxRows && this.formArray.length >= maxRows) {
      return;
    }
    this.formArray.push(this.createRowGroup());
    this.updateTableData();
  }

  removeRow(index: number): void {
    const minRows = this.config.minRows || 0;
    if (this.formArray.length > minRows) {
      this.formArray.removeAt(index);
      this.updateTableData();
    }
  }

  getRowFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  get rows(): FormGroup[] {
    return this.tableData();
  }

  canAddRow(): boolean {
    if (this.config.allowAddRow === false) return false;
    const maxRows = this.config.maxRows;
    return !maxRows || this.formArray.length < maxRows;
  }

  canRemoveRow(): boolean {
    if (this.config.allowDeleteRow === false) return false;
    const minRows = this.config.minRows || 0;
    return this.formArray.length > minRows;
  }

  getColumnByName(name: string): TableColumnConfig | undefined {
    return this.config.columns.find(col => col.name === name);
  }

  isDataColumn(columnName: string): boolean {
    return columnName !== 'rowNumber' && columnName !== 'actions';
  }

  /** Obtener el valor de una celda para mostrar en la tabla (modo modal) */
  getCellDisplayValue(row: FormGroup, columnName: string): string {
    const value = row.get(columnName)?.value;
    const column = this.getColumnByName(columnName);

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // Para selects, mostrar el label en vez del value
    if (column?.type === 'select' && column.options) {
      const option = column.options.find(opt => opt.value === value);
      return option?.label || String(value);
    }

    return String(value);
  }

  /** Abrir diálogo para agregar nueva fila */
  openAddDialog(): void {
    if (!this.canAddRow()) return;

    const dialogData: RowEditDialogData = {
      columns: this.config.columns,
      rowData: null,
      isNew: true,
      chatConfig: {
        enabled: this.enableChat,
        evaluationId: this.evaluationId,
        companyId: this.companyId,
        userId: this.userId,
      },
      allowPhotos: this.config.allowPhotos,
    };

    const dialogRef = this.dialog.open(RowEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: RowEditDialogResult | undefined) => {
      if (result) {
        const rowGroup = this.createRowGroup();
        rowGroup.patchValue(result.data);
        this.formArray.push(rowGroup);
        this.updateTableData();
      }
    });
  }

  /** Abrir diálogo para editar fila existente */
  openEditDialog(index: number): void {
    const rowGroup = this.getRowFormGroup(index);

    const dialogData: RowEditDialogData = {
      columns: this.config.columns,
      rowData: rowGroup.value,
      isNew: false,
      rowIndex: index,
      chatConfig: {
        enabled: this.enableChat,
        evaluationId: this.evaluationId,
        companyId: this.companyId,
        userId: this.userId,
      },
      allowPhotos: this.config.allowPhotos,
    };

    const dialogRef = this.dialog.open(RowEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: RowEditDialogResult | undefined) => {
      if (result && result.rowIndex !== undefined) {
        const formGroup = this.getRowFormGroup(result.rowIndex);
        formGroup.patchValue(result.data);
        this.updateTableData();
      }
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: Record<string, unknown>[] | null): void {
    if (value && Array.isArray(value) && value.length > 0) {
      // Si formArray aún no está inicializado, guardar para aplicar después
      if (!this.formArray) {
        this.pendingValue = value;
        return;
      }

      this.applyValue(value);
    }
  }

  registerOnChange(fn: (value: Record<string, unknown>[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formArray.disable();
    } else {
      this.formArray.enable();
    }
  }
}
