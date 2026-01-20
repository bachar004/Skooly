import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantAcceuil } from './etudiant-acceuil';

describe('EtudiantAcceuil', () => {
  let component: EtudiantAcceuil;
  let fixture: ComponentFixture<EtudiantAcceuil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantAcceuil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantAcceuil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
