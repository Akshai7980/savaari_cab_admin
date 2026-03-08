import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private requestCount = signal(0);

    // Publicly exposed signal to check if loading
    readonly isLoading = computed(() => this.requestCount() > 0);

    /**
     * Increments the request counter.
     * Can include a delay logic here if needed, but usually handled in the interceptor.
     */
    show(): void {
        this.requestCount.update(count => count + 1);
    }

    /**
     * Decrements the request counter.
     */
    hide(): void {
        this.requestCount.update(count => Math.max(0, count - 1));
    }
}
