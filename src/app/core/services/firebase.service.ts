import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, first } from 'rxjs';
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
      this.userDetails = user;
      this.userProfileSubscription.next(this.userDetails);
      this.authService.updateCurrentUser(user);
      this.router.navigate(['/dashboard']);
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
      return new BehaviorSubject<User | null>(this.userDetails).asObservable().pipe(first());
    }

    const savedUser = this.authService.getSession();
    if (savedUser?.uid) {
      return this.fetchUserDetails(savedUser.uid);
    }

    return new BehaviorSubject<User | null>(null).asObservable().pipe(first());
  }

  // Get Saved User Functionality ----------------
  getSavedUser() {
    const user = JSON.parse(sessionStorage.getItem('savaariUser') || 'null');
    if (user) return user;
    this.signOut();
  }

  /**
   * Updates user profile data on session start or profile change.
   */
  updateSavedUserDetails(): void {
    const savedUser = this.authService.getSession();
    if (savedUser?.uid) {
      this.fetchUserDetails(savedUser.uid).subscribe((user) => {
        this.userDetails = user;
        this.userProfileSubscription.next(this.userDetails);
        this.authService.updateCurrentUser(user);
      });
    }
  }

  /**
   * Adds a new driver booking.
   */
  addDriverBooking(driverBooking: DriverBooking) {
    return this.fireStore.collection('driverBooking').add(driverBooking);
  }

  /**
   * Adds a new registered driver.
   */
  addDrivers(driver: Driver) {
    return this.fireStore.collection('registeredDrivers').add(driver);
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
   * Returns an observable of all user OTPs (mapped to any for now as schema is unclear).
   */
  getUserOTPs(): Observable<any[]> {
    return this.fireStore.collection('userOtp').valueChanges();
  }

  /**
   * Updates trip status for a specific booking.
   */
  updateTripStatus(params: Partial<DriverBooking> & { docId: string }): Promise<void> {
    const collection = this.fireStore.collection('driverBooking');
    return collection.ref.where('docId', '==', params.docId)
      .get()
      .then((snapshot) => {
        if (snapshot.size === 1) {
          return snapshot.docs[0].ref.update(params);
        } else {
          throw new Error('Document not found or multiple documents match the ID.');
        }
      });
  }

  /**
   * Creates a unique ID for Firestore documents.
   */
  createId(): string {
    return this.fireStore.createId();
  }

  /**
   * Applies for a driver leave.
   */
  applyDriverLeave(driverLeave: DriverLeave) {
    return this.fireStore.collection('allAppliedLeaves').add(driverLeave);
  }

  /**
   * Returns an observable of all applied leaves.
   */
  getDriverAppliedLeaves(): Observable<DriverLeave[]> {
    return this.fireStore.collection<DriverLeave>('allAppliedLeaves').valueChanges();
  }

  /**
   * Updates status for a driver leave request.
   */
  updateLeaveStatus(params: Partial<DriverLeave> & { docId: string }): Promise<void> {
    return this.fireStore
      .collection('allAppliedLeaves')
      .ref.where('docId', '==', params.docId)
      .get()
      .then((snapshot) => {
        if (snapshot.size === 1) {
          return snapshot.docs[0].ref.update(params);
        } else {
          throw new Error('Leave document not found or duplicate IDs found.');
        }
      });
  }

  /**
   * Returns an observable of all registered drivers.
   */
  getDriverList(): Observable<Driver[]> {
    return this.fireStore.collection<Driver>('registeredDrivers').valueChanges();
  }

  /**
   * Adds new vehicle details.
   */
  addVehicleDetails(vehicle: Vehicle) {
    return this.fireStore.collection('addVehicleDetails').add(vehicle);
  }

  /**
   * Returns an observable of all vehicle details.
   */
  getAllVehicleDetails(): Observable<Vehicle[]> {
    return this.fireStore.collection<Vehicle>('addVehicleDetails').valueChanges();
  }

  /**
   * Fetches specific vehicle details by document ID.
   */
  fetchVehicleDetails(docId: string): Observable<Vehicle | null> {
    return new Observable((subscriber) => {
      this.fireStore
        .collection<Vehicle>('addVehicleDetails')
        .ref.where('docId', '==', docId)
        .get()
        .then((snapshot) => {
          if (snapshot.size === 1) {
            subscriber.next(snapshot.docs[0].data() as Vehicle);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Vehicle not found or multiple vehicle match the ID.'));
          }
        })
        .catch((error) => subscriber.error(error));
    });
  }

  /**
   * Updates vehicle details.
   */
  updateVehicleDetails(data: Partial<Vehicle> & { docId: string }): Promise<void> {
    return this.fireStore
      .collection('addVehicleDetails')
      .ref.where('docId', '==', data.docId)
      .get()
      .then((snapshot) => {
        if (snapshot.size === 1) {
          return snapshot.docs[0].ref.update(data);
        } else {
          throw new Error('Vehicle not found or multiple vehicle match the ID.');
        }
      });
  }

  /**
   * Deletes a vehicle by ID.
   */
  deleteVehicle(id: string): Promise<void> {
    return this.fireStore
      .collection('addVehicleDetails')
      .ref.where('docId', '==', id)
      .get()
      .then((snapshot) => {
        if (snapshot.size === 1) {
          return snapshot.docs[0].ref.delete();
        } else {
          throw new Error('Vehicle not found or multiple vehicle match the ID.');
        }
      });
  }

  /**
   * Fetches specific booking detail by ID.
   */
  getBookingDetailById(id: string): Observable<DriverBooking | null> {
    return new Observable((subscriber) => {
      this.fireStore
        .collection<DriverBooking>('driverBooking')
        .ref.where('docId', '==', id)
        .get()
        .then((snapshot) => {
          if (snapshot.size === 1) {
            subscriber.next(snapshot.docs[0].data() as DriverBooking);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Booking Details not found.'));
          }
        })
        .catch((error) => subscriber.error(error));
    });
  }

  /**
   * Updates booking detail by ID.
   */
  updateBookingDetailById(params: Partial<DriverBooking> & { docId: string }): Promise<void> {
    return this.fireStore
      .collection('driverBooking')
      .ref.where('docId', '==', params.docId)
      .get()
      .then((snapshot) => {
        if (snapshot.size === 1) {
          return snapshot.docs[0].ref.update(params);
        } else {
          throw new Error('Document not found or multiple documents match the ID.');
        }
      });
  }

  getDocument(collection: string, docId: string): Observable<any> {
    // Note: This expects a 'docId' field in the document content as per previous patterns
    return this.fireStore.collection(collection, ref => ref.where('docId', '==', docId)).valueChanges().pipe(first());
  }

  updateDocument(collection: string, docId: string, data: any): Promise<void> {
    return this.fireStore.collection(collection).ref.where('docId', '==', docId).get().then(snapshot => {
      if (!snapshot.empty) {
        return snapshot.docs[0].ref.update(data);
      } else {
        throw new Error('Document not found');
      }
    });
  }

  addDocument(collection: string, data: any): Promise<any> {
    return this.fireStore.collection(collection).add(data);
  }

}
