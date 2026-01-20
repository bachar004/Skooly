import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEtudiantlist } from './admin-etudiantlist';

describe('AdminEtudiantlist', () => {
  let component: AdminEtudiantlist;
  let fixture: ComponentFixture<AdminEtudiantlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEtudiantlist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEtudiantlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
