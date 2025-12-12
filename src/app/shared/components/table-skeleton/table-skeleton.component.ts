import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      <div class="skeleton-table">
        <!-- Header -->
        <div class="skeleton-row skeleton-header">
          <div class="skeleton-cell" *ngFor="let col of columnsArray"></div>
        </div>

        <!-- Rows -->
        <div class="skeleton-row" *ngFor="let row of rowsArray">
          <div class="skeleton-cell" *ngFor="let col of columnsArray">
            <div class="skeleton-content"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .skeleton-container {
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .skeleton-table {
        width: 100%;
      }

      .skeleton-row {
        display: flex;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .skeleton-header {
        border-bottom: 2px solid #e0e0e0;
      }

      .skeleton-cell {
        flex: 1;
        min-width: 0;
      }

      .skeleton-content {
        height: 16px;
        background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
        background-size: 200% 100%;
        border-radius: 4px;
        animation: shimmer 1.5s infinite;
      }

      .skeleton-header .skeleton-content {
        height: 20px;
        background: linear-gradient(90deg, #e0e0e0 0%, #e8e8e8 50%, #e0e0e0 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .skeleton-row:last-child {
        border-bottom: none;
      }
    `,
  ],
})
export class TableSkeletonComponent {
  @Input() rows = 5;
  @Input() columns = 4;

  get rowsArray() {
    return Array(this.rows).fill(0);
  }

  get columnsArray() {
    return Array(this.columns).fill(0);
  }
}
