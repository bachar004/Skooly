import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantNotes } from './etudiant-notes';

describe('EtudiantNotes', () => {
  let component: EtudiantNotes;
  let fixture: ComponentFixture<EtudiantNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantNotes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantNotes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
