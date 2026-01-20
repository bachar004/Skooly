import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profnotes } from './profnotes';

describe('Profnotes', () => {
  let component: Profnotes;
  let fixture: ComponentFixture<Profnotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profnotes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profnotes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
