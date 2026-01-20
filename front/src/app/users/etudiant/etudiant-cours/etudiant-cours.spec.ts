import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantCours } from './etudiant-cours';

describe('EtudiantCours', () => {
  let component: EtudiantCours;
  let fixture: ComponentFixture<EtudiantCours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantCours]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantCours);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
