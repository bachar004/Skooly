import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loginetudiant } from './loginetudiant';

describe('Loginetudiant', () => {
  let component: Loginetudiant;
  let fixture: ComponentFixture<Loginetudiant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loginetudiant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loginetudiant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
