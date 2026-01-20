import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { etudiantGuard } from './etudiant-guard';
import { EtudiantConnexionService } from './etudiant-connexion-service';

describe('EtudiantGuard', () => {
  let guard: etudiantGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let serviceSpy: jasmine.SpyObj<EtudiantConnexionService>;

  beforeEach(() => {
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const service = jasmine.createSpyObj('EtudiantConnexionService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        etudiantGuard,
        { provide: Router, useValue: router },
        { provide: EtudiantConnexionService, useValue: service },
      ],
    });

    guard = TestBed.inject(etudiantGuard);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    serviceSpy = TestBed.inject(EtudiantConnexionService) as jasmine.SpyObj<EtudiantConnexionService>;
  });

  it('should allow activation when logged in', () => {
    serviceSpy.isloggedin.and.returnValue(true);
    expect(guard.canActivateChild()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when not logged in', () => {
    serviceSpy.isloggedin.and.returnValue(false);
    expect(guard.canActivateChild()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login/etudiant']);
  });
});
