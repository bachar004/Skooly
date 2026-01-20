import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Proflogin } from './proflogin';

describe('Proflogin', () => {
  let component: Proflogin;
  let fixture: ComponentFixture<Proflogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Proflogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Proflogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
