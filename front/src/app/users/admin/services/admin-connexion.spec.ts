import { TestBed } from '@angular/core/testing';
import { AdminConnexion } from './admin-connexion';

describe('AdminConnexion', () => {
  let service: AdminConnexion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminConnexion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
