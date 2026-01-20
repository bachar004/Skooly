import { TestBed } from '@angular/core/testing';

import { AdminProfService } from './admin-prof-service';

describe('AdminProfService', () => {
  let service: AdminProfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminProfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
