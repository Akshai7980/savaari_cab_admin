import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PickerManagerService {
    private activePickerId = new Subject<string>();
    activePickerId$ = this.activePickerId.asObservable();

    openPicker(fieldId: string) {
        this.activePickerId.next(fieldId);
    }
}
