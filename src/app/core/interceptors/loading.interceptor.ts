import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize, timer, switchMap, of } from 'rxjs';

/**
 * Context token to bypass the loading spinner for specific requests.
 */
export const SILENT_REQUEST = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);

    // Check if the request is marked as silent
    if (req.context.get(SILENT_REQUEST)) {
        return next(req);
    }

    // Show loader with a 200ms delay to prevent flickering on fast requests
    // We use a simple counter approach. For the delay, we can either delay the 'show' 
    // or just show it immediately. Given the counter requirement, immediate is safer 
    // to track count correctly.

    loadingService.show();

    return next(req).pipe(
        finalize(() => {
            loadingService.hide();
        })
    );
};
