export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    type?: string;
}

export interface SessionUser {
    type: string;
    uid: string;
}
