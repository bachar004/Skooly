import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profnotifications } from './profnotifications';

describe('Profnotifications', () => {
  let component: Profnotifications;
  let fixture: ComponentFixture<Profnotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profnotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profnotifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
