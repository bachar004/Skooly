import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantNotifications } from './etudiant-notifications';

describe('EtudiantNotifications', () => {
  let component: EtudiantNotifications;
  let fixture: ComponentFixture<EtudiantNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantNotifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
