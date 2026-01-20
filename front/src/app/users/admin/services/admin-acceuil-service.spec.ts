import { TestBed } from '@angular/core/testing';

import { AdminAcceuilService } from './admin-acceuil-service';

describe('AdminAcceuilService', () => {
  let service: AdminAcceuilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAcceuilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
