import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAbscences } from './admin-abscences';

describe('AdminAbscences', () => {
  let component: AdminAbscences;
  let fixture: ComponentFixture<AdminAbscences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAbscences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAbscences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
