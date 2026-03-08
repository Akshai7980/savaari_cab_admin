import { TestBed } from '@angular/core/testing';
import { FirebaseService } from './firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { SnackbarService } from './snackbar.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { Driver } from '../models/driver.model';

describe('FirebaseService', () => {
    let service: FirebaseService;
    let firestoreSpy: jasmine.SpyObj<AngularFirestore>;
    let afAuthSpy: any;
    let snackBarSpy: jasmine.SpyObj<SnackbarService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        const firestoreMock = jasmine.createSpyObj('AngularFirestore', ['collection', 'createId']);
        const snackBarMock = jasmine.createSpyObj('SnackbarService', ['showMessage']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate']);
        const authServiceMock = jasmine.createSpyObj('AuthService', ['saveSession', 'getSession', 'clearSession', 'updateCurrentUser']);

        // Simple mock for afAuth
        const afAuthMock = {
            signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
            createUserWithEmailAndPassword: jasmine.createSpy('createUserWithEmailAndPassword'),
            signOut: jasmine.createSpy('signOut'),
            idToken: of('mock-token')
        };

        TestBed.configureTestingModule({
            providers: [
                FirebaseService,
                { provide: AngularFirestore, useValue: firestoreMock },
                { provide: AngularFireAuth, useValue: afAuthMock },
                { provide: SnackbarService, useValue: snackBarMock },
                { provide: Router, useValue: routerMock },
                { provide: AuthService, useValue: authServiceMock }
            ]
        });

        service = TestBed.inject(FirebaseService);
        firestoreSpy = TestBed.inject(AngularFirestore) as jasmine.SpyObj<AngularFirestore>;
        snackBarSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getRegisteredDrivers', () => {
        it('should correctly map the incoming stream of data from Firestore collection', (done) => {
            // Arrange
            const mockDrivers: Driver[] = [
                { driverName: 'John Doe', driverCode: 'D001', mobileNumber: '9999999999' },
                { driverName: 'Jane Smith', driverCode: 'D002', mobileNumber: '8888888888' }
            ];

            const collectionSpy = jasmine.createSpyObj('collection', ['valueChanges']);
            collectionSpy.valueChanges.and.returnValue(of(mockDrivers));
            firestoreSpy.collection.and.returnValue(collectionSpy);

            // Act
            service.getRegisteredDrivers().subscribe({
                next: (drivers) => {
                    // Assert
                    expect(drivers.length).toBe(2);
                    expect(drivers[0].driverName).toBe('John Doe');
                    expect(drivers[1].driverCode).toBe('D002');
                    expect(firestoreSpy.collection).toHaveBeenCalledWith('registeredDrivers' as any);
                    done();
                },
                error: done.fail
            });
        });
    });
});
