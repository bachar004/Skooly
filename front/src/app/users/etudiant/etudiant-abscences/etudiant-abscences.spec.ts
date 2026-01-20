import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantAbscences } from './etudiant-abscences';

describe('EtudiantAbscences', () => {
  let component: EtudiantAbscences;
  let fixture: ComponentFixture<EtudiantAbscences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantAbscences]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantAbscences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
