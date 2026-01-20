import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profsidebar } from './profsidebar';

describe('Profsidebar', () => {
  let component: Profsidebar;
  let fixture: ComponentFixture<Profsidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profsidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profsidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
