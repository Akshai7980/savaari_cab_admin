import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, first } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private userDetails = null;
  userProfileSubscription = new BehaviorSubject(null);

  constructor(
    private readonly afAuth: AngularFireAuth,
    private readonly fireStore: AngularFirestore,
    private readonly snackBar: SnackbarService,
    private readonly router: Router
  ) {}

  // User Login Functionality ----------------
  login(email: string, password: string) {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((data: any) => {
        const uid = data.user.uid;
        localStorage.setItem('savaariUser', JSON.stringify({ type: 'user', uid }));
        this.loginSuccessHandler(uid);
      })
      .catch((error: any) => {
        console.log('error while signup');
        console.log(error);
        this.loginFailureHandler();
      });
  }

  // User Register Functionality ----------------
  register(email: string, password: string, userDetails = {}) {
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data: any) => {
        console.log('login successful');
        this.loginSuccessHandler(data.user.uid);
        const uid = data.user.uid;
        this.fireStore
          .collection('users')
          .doc(uid)
          .set(userDetails, { merge: true })
          .then((d) => {
            console.log('user details updated');
            localStorage.setItem('savaariUser', JSON.stringify({ type: 'user', uid }));
            this.loginSuccessHandler(uid);
          });
      })
      .catch((error: any) => {
        console.log('error while signup');
        console.log(error);
      });
  }

  // User Login Success Handler Functionality ----------------
  loginSuccessHandler(uid: string) {
    this.snackBar.showMessage('Login Successful');
    this.fetchUserDetails(uid).then((d) => {
      this.userProfileSubscription.next(this.userDetails);
      this.router.navigate(['/dashboard']);
    });
  }

  // User Login Failure Handler Functionality ----------------
  loginFailureHandler() {
    this.snackBar.showMessage('Login Failed');
  }

  // Fetch User Details Functionality ----------------
  fetchUserDetails(uid: string) {
    return new Promise((resolve) => {
      this.fireStore
        .collection('users')
        .doc(uid)
        .valueChanges()
        .pipe(first())
        .subscribe((data: any) => {
          this.userDetails = data;
          resolve(data);
        });
    });
  }

  // User Log-Out Functionality ----------------
  async signOut() {
    this.afAuth.signOut();
    localStorage.removeItem('savaariUser');
    this.router.navigate(['/admin/login']);
  }

  // Get Current User Details Functionality ----------------
  getCurrentUserDetails() {
    return new Promise((resolve) => {
      if (this.userDetails) {
        resolve(this.userDetails);
      }
      const savedUser = this.getSavedUser();
      if (savedUser && savedUser.uid) {
        this.fetchUserDetails(savedUser.uid).then((d) => resolve(d));
      } else {
        resolve(null);
      }
    });
  }

  // Get Saved User Functionality ----------------
  getSavedUser() {
    const user = JSON.parse(localStorage.getItem('savaariUser') || 'null');
    if (user) return user;
    this.signOut();
  }

  // Update Saved User Details Functionality ----------------
  updateSavedUserDetails() {
    const savedUser = this.getSavedUser();
    if (savedUser && savedUser.uid) {
      this.fetchUserDetails(savedUser.uid).then((d) => {
        this.userProfileSubscription.next(this.userDetails);
      });
    }
  }

  addDriverBooking(driverBooking: any) {
    return this.fireStore.collection('driverBooking').add(driverBooking);
  }

  addDrivers(driver: any) {
    return this.fireStore.collection('registeredDrivers').add(driver);
  }

  getDriverBooking(): Observable<any[]> {
    return this.fireStore.collection('driverBooking').valueChanges();
  }

  getRegisteredDrivers(): Observable<any[]> {
    return this.fireStore.collection('registeredDrivers').valueChanges();
  }

  getUserOTPs(): Observable<any[]> {
    return this.fireStore.collection('userOtp').valueChanges();
  }

  findDocumentById(id: string): QueryFn {
    return (ref) => ref.where('docId', '==', id);
  }

  updateTripStatus(params: any): Promise<void> {
    console.log(params);

    const query = this.findDocumentById(params.docId);

    return this.fireStore
      .collection('driverBooking')
      .ref.where('docId', '==', params.docId)
      .get()
      .then((snapshot) => {
        if (snapshot.size === 1) {
          const docRef = snapshot.docs[0].ref;

          return docRef.update(params);
        } else {
          throw new Error('Document not found or multiple documents match the ID.');
        }
      })
      .catch((error) => {
        console.error('Error updating trip status:', error);
        throw error;
      });
  }

  createId() {
    this.fireStore.createId();
  }
}
