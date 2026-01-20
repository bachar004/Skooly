import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEtudiant } from './admin-etudiant';

describe('AdminEtudiant', () => {
  let component: AdminEtudiant;
  let fixture: ComponentFixture<AdminEtudiant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEtudiant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEtudiant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
