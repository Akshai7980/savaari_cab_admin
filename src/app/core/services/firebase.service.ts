import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, first, map, of } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { Driver } from '../models/driver.model';
import { DriverBooking } from '../models/booking.model';
import { Vehicle } from '../models/vehicle.model';
import { DriverLeave } from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private userDetails: User | null = null;
  userProfileSubscription = new BehaviorSubject<User | null>(null);

  constructor(
    private readonly afAuth: AngularFireAuth,
    private readonly fireStore: AngularFirestore,
    private readonly snackBar: SnackbarService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) { }

  /**
   * Authenticats a user with email and password.
   */
  login(email: string, password: string): void {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((data) => {
        if (data.user) {
          const uid = data.user.uid;
          this.authService.saveSession(uid);
          this.loginSuccessHandler(uid);
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        this.loginFailureHandler();
      });
  }

  /**
   * Registers a new user.
   */
  register(email: string, password: string, userDetails: Partial<User> = {}): void {
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        if (data.user) {
          const uid = data.user.uid;
          this.fireStore
            .collection('users')
            .doc(uid)
            .set(userDetails, { merge: true })
            .then(() => {
              this.authService.saveSession(uid);
              this.loginSuccessHandler(uid);
            });
        }
      })
      .catch((error) => {
        console.error('Registration error:', error);
      });
  }

  /**
   * Success handler after login.
   */
  private loginSuccessHandler(uid: string): void {
    this.snackBar.showMessage('Login Successful');
    this.fetchUserDetails(uid).subscribe((user) => {
      if (user) {
        this.userDetails = user;
        this.userProfileSubscription.next(this.userDetails);
        this.authService.updateCurrentUser(user);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private loginFailureHandler(): void {
    this.snackBar.showMessage('Login Failed');
  }

  /**
   * Fetches user details from Firestore.
   */
  fetchUserDetails(uid: string): Observable<User | null> {
    return this.fireStore
      .collection('users')
      .doc<User>(uid)
      .valueChanges()
      .pipe(first());
  }

  /**
   * Signs out the current user.
   */
  async signOut(): Promise<void> {
    await this.afAuth.signOut();
    this.authService.clearSession();
    this.router.navigate(['/admin/login']);
  }

  /**
   * Gets current user details, checking cache first.
   */
  getCurrentUserDetails(): Observable<User | null> {
    if (this.userDetails) {
      return of(this.userDetails);
    }

    const savedUser = this.authService.getSession();
    if (savedUser?.uid) {
      return this.fetchUserDetails(savedUser.uid);
    }

    return of(null);
  }

  // Get Saved User Functionality ----------------
  getSavedUser(): User | null {
    const userStr = sessionStorage.getItem('savaariUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing saved user', e);
      }
    }
    this.signOut();
    return null;
  }

  /**
   * Updates user profile data on session start or profile change.
   */
  updateSavedUserDetails(): void {
    const savedUser = this.authService.getSession();
    if (savedUser?.uid) {
      this.fetchUserDetails(savedUser.uid).subscribe((user) => {
        if (user) {
          this.userDetails = user;
          this.userProfileSubscription.next(this.userDetails);
          this.authService.updateCurrentUser(user);
        }
      });
    }
  }

  /**
   * Returns an observable of all driver bookings.
   */
  getDriverBooking(): Observable<DriverBooking[]> {
    return this.fireStore.collection<DriverBooking>('driverBooking').valueChanges();
  }

  /**
   * Returns an observable of all registered drivers.
   */
  getRegisteredDrivers(): Observable<Driver[]> {
    return this.fireStore.collection<Driver>('registeredDrivers').valueChanges();
  }

  /**
   * Returns an observable of all user OTPs.
   */
  getUserOTPs(): Observable<unknown[]> {
    return this.fireStore.collection('userOtp').valueChanges();
  }

  /**
   * Generic method to get a document by a custom 'docId' field.
   */
  getDocument<T>(collectionName: string, docId: string): Observable<T | null> {
    return this.fireStore.collection<T>(collectionName, ref => ref.where('docId', '==', docId))
      .valueChanges()
      .pipe(first(), map(docs => docs.length > 0 ? docs[0] : null));
  }

  /**
   * Generic method to update a document identified by a 'docId' field.
   */
  updateDocument<T extends { docId?: string }>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    return this.fireStore.collection(collectionName).ref.where('docId', '==', docId).get().then(snapshot => {
      if (!snapshot.empty) {
        return snapshot.docs[0].ref.update(data);
      } else {
        throw new Error(`Document with docId ${docId} not found in ${collectionName}`);
      }
    });
  }

  /**
   * Generic method to add a new document.
   */
  addDocument<T>(collectionName: string, data: T): Promise<any> {
    return this.fireStore.collection(collectionName).add(data);
  }

  /**
   * Deletes a document identified by its custom 'docId' field.
   */
  deleteDocument(collectionName: string, docId: string): Promise<void> {
    return this.fireStore.collection(collectionName).ref.where('docId', '==', docId).get().then(snapshot => {
      if (!snapshot.empty) {
        return snapshot.docs[0].ref.delete();
      } else {
        throw new Error(`Document with docId ${docId} not found in ${collectionName}`);
      }
    });
  }

  /**
   * Returns an observable of all documents in a collection.
   */
  getCollection<T>(collectionName: string): Observable<T[]> {
    return this.fireStore.collection<T>(collectionName).valueChanges();
  }

  // Deprecated specific methods (re-mapped to generic ones)
  addDriverBooking(driverBooking: DriverBooking) { return this.addDocument('driverBooking', driverBooking); }
  addDrivers(driver: Driver) { return this.addDocument('registeredDrivers', driver); }
  applyDriverLeave(driverLeave: DriverLeave) { return this.addDocument('allAppliedLeaves', driverLeave); }
  getDriverAppliedLeaves() { return this.getCollection<DriverLeave>('allAppliedLeaves'); }
  getDriverList() { return this.getCollection<Driver>('registeredDrivers'); }
  addVehicleDetails(vehicle: Vehicle) { return this.addDocument('addVehicleDetails', vehicle); }
  getAllVehicleDetails() { return this.getCollection<Vehicle>('addVehicleDetails'); }

  deleteVehicle(id: string) { return this.deleteDocument('addVehicleDetails', id); }

  updateTripStatus(params: Partial<DriverBooking> & { docId: string }) {
    return this.updateDocument('driverBooking', params.docId, params);
  }
  updateLeaveStatus(params: Partial<DriverLeave> & { docId: string }) {
    return this.updateDocument('allAppliedLeaves', params.docId, params);
  }
  updateVehicleDetails(data: Partial<Vehicle> & { docId: string }) {
    return this.updateDocument('addVehicleDetails', data.docId, data);
  }
  updateBookingDetailById(params: Partial<DriverBooking> & { docId: string }) {
    return this.updateDocument('driverBooking', params.docId, params);
  }

  getBookingDetailById(docId: string): Observable<DriverBooking | null> {
    return this.getDocument<DriverBooking>('driverBooking', docId);
  }

  createId(): string {
    return this.fireStore.createId();
  }


}
