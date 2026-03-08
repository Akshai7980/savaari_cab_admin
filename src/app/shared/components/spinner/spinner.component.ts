import { Component, Input, OnDestroy, Inject, ViewEncapsulation, inject, effect } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

import { Spinkit } from './spinkits';

@Component({
  selector: 'app-spinner',
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
  private isNavigationPending = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    // React to loading service changes
    effect(() => {
      this.updateVisibility();
    });

    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationStart) {
          this.isNavigationPending = true;
          this.updateVisibility();
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          this.isNavigationPending = false;
          this.updateVisibility();
        }
      },
      () => {
        this.isNavigationPending = false;
        this.updateVisibility();
      }
    );
  }

  private updateVisibility(): void {
    this.isSpinnerVisible = this.isNavigationPending || this.loadingService.isLoading();
  }

  // life cycle event
  ngOnDestroy(): void {
    this.isSpinnerVisible = false;
  }
}
