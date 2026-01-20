import { TestBed } from '@angular/core/testing';

import { AdminEtudiantService } from './admin-etudiant-service';

describe('AdminEtudiantService', () => {
  let service: AdminEtudiantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminEtudiantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
