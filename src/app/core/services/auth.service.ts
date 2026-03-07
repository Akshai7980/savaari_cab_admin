import { Injectable, signal } from '@angular/core';
import { SessionUser, User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly USER_KEY = 'savaariUser';

    // Using Signals for modern Angular reactivity
    currentUser = signal<User | null>(null);

    /**
     * Saves user session data.
     */
    saveSession(uid: string, type: string = 'user'): void {
        const sessionUser: SessionUser = { type, uid };
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(sessionUser));
    }

    /**
     * Retrieves user session data.
     */
    getSession(): SessionUser | null {
        const sessionData = sessionStorage.getItem(this.USER_KEY);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    /**
     * Clears user session data.
     */
    clearSession(): void {
        sessionStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
    }

    /**
     * Updates current user signal.
     */
    updateCurrentUser(user: User | null): void {
        this.currentUser.set(user);
    }
}
