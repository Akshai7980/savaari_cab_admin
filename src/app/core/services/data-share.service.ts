import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  private dataSubject = new BehaviorSubject<any>([]);
  public data$ = this.dataSubject.asObservable();

  constructor() {}

  updateData(newData: any) {
    this.dataSubject.next(newData);
  }
}
