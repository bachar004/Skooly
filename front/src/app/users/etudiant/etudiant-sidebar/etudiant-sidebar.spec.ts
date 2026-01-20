import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantSidebar } from './etudiant-sidebar';

describe('EtudiantSidebar', () => {
  let component: EtudiantSidebar;
  let fixture: ComponentFixture<EtudiantSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
