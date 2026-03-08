import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="loader-overlay d-flex flex-column justify-content-center align-items-center">
      <div class="premium-spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
      <span class="loading-text mt-3 fw-bold">{{ message }}</span>
    </div>
  `,
  styles: [`
    .loader-overlay {
      min-height: 400px;
      animation: fadeIn 0.3s ease-in-out;
    }

    .premium-spinner {
      width: 50px;
      height: 50px;
      position: relative;
    }

    .double-bounce1, .double-bounce2 {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #673ab7; /* Primary Violet */
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 0;
      animation: sk-bounce 2.0s infinite ease-in-out;
    }

    .double-bounce2 {
      animation-delay: -1.0s;
    }

    .loading-text {
      color: #673ab7;
      letter-spacing: 1px;
      animation: pulse 1.5s infinite;
    }

    @keyframes sk-bounce {
      0%, 100% { transform: scale(0.0) }
      50% { transform: scale(1.0) }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class FormLoaderComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Loading Form...';
}
