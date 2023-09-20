import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAllDriversComponent } from './list-all-drivers.component';

describe('ListAllDriversComponent', () => {
  let component: ListAllDriversComponent;
  let fixture: ComponentFixture<ListAllDriversComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListAllDriversComponent]
    });
    fixture = TestBed.createComponent(ListAllDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
