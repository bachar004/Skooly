import { TestBed } from '@angular/core/testing';

import { EtudiantConnexionService } from './etudiant-connexion-service';

describe('EtudiantConnexionService', () => {
  let service: EtudiantConnexionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtudiantConnexionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
