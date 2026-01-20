import { TestBed } from '@angular/core/testing';

import { Profservice } from './profservice';

describe('Profservice', () => {
  let service: Profservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Profservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
