import { Component, Input, OnDestroy, Inject, ViewEncapsulation, inject, effect, DestroyRef } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Spinkit } from './spinkits';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss', './spinkit-css/sk-line-material.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnDestroy {
  isSpinnerVisible = true;
  Spinkit = Spinkit;
  @Input() backgroundColor = '#2689E2';
  @Input() spinner = Spinkit.skLine;

  private loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);
  private isNavigationPending = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    // React to loading service changes
    effect(() => {
      this.updateVisibility();
    });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event instanceof NavigationStart) {
            this.isNavigationPending = true;
            this.updateVisibility();
          } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            this.isNavigationPending = false;
            this.updateVisibility();
          }
        },
        error: () => {
          this.isNavigationPending = false;
          this.updateVisibility();
        }
      });
  }

  private updateVisibility(): void {
    this.isSpinnerVisible = this.isNavigationPending || this.loadingService.isLoading();
  }

  // life cycle event
  ngOnDestroy(): void {
    this.isSpinnerVisible = false;
  }
}
