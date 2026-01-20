import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesSeances } from './mes-seances';

describe('MesSeances', () => {
  let component: MesSeances;
  let fixture: ComponentFixture<MesSeances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesSeances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesSeances);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
