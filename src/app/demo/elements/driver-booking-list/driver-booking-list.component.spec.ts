import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverBookingListComponent } from './driver-booking-list.component';

describe('DriverBookingListComponent', () => {
  let component: DriverBookingListComponent;
  let fixture: ComponentFixture<DriverBookingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DriverBookingListComponent]
    });
    fixture = TestBed.createComponent(DriverBookingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
