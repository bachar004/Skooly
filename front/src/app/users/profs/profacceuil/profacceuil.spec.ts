import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profacceuil } from './profacceuil';

describe('Profacceuil', () => {
  let component: Profacceuil;
  let fixture: ComponentFixture<Profacceuil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profacceuil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profacceuil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
