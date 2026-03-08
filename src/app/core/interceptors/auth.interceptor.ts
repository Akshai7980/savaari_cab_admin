import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const afAuth = inject(AngularFireAuth);
    const router = inject(Router);

    // Skip auth for login and public APIs
    if (req.url.includes('login') || req.url.includes('public-api')) {
        return next(req);
    }

    // Handle Firebase token injection
    return afAuth.idToken.pipe(
        take(1),
        switchMap(token => {
            let authReq = req;
            if (token) {
                authReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            return next(authReq);
        }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Trigger logout or redirect
                router.navigate(['/admin/login']);
            }
            return throwError(() => error);
        })
    );
};
