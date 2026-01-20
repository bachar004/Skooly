import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotes } from './admin-notes';

describe('AdminNotes', () => {
  let component: AdminNotes;
  let fixture: ComponentFixture<AdminNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNotes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
