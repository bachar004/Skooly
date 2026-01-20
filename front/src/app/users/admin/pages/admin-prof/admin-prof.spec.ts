import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProf } from './admin-prof';

describe('AdminProf', () => {
  let component: AdminProf;
  let fixture: ComponentFixture<AdminProf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
