import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSavingsComponent } from './admin-savings.component';

describe('AdminSavingsComponent', () => {
  let component: AdminSavingsComponent;
  let fixture: ComponentFixture<AdminSavingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSavingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
