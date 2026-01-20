import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAcceuil } from './admin-acceuil';

describe('AdminAcceuil', () => {
  let component: AdminAcceuil;
  let fixture: ComponentFixture<AdminAcceuil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAcceuil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAcceuil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
