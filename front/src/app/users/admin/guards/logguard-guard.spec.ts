import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminConnexion } from '../services/admin-connexion';
import { logguardGuard } from './logguard-guard';

describe('logguardGuard', () => {
  let guard: logguardGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let serviceSpy: jasmine.SpyObj<AdminConnexion>;

  beforeEach(() => {
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const service = jasmine.createSpyObj('AdminConnexion', ['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        logguardGuard,
        { provide: Router, useValue: router },
        { provide: AdminConnexion, useValue: service },
      ],
    });

    guard = TestBed.inject(logguardGuard);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    serviceSpy = TestBed.inject(AdminConnexion) as jasmine.SpyObj<AdminConnexion>;
  });

  it('should allow activation when admin is logged in', () => {
    serviceSpy.isLoggedIn.and.returnValue(true);
    expect(guard.canActivateChild()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when admin is not logged in', () => {
    serviceSpy.isLoggedIn.and.returnValue(false);
    expect(guard.canActivateChild()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login/admin']);
  });
});
