import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profcours } from './profcours';

describe('Profcours', () => {
  let component: Profcours;
  let fixture: ComponentFixture<Profcours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profcours]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profcours);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
