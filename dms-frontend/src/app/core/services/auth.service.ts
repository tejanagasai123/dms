import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiBaseUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                this.currentUserSubject.next(JSON.parse(user));
            } catch (e) {
                console.error('Failed to parse user from storage', e);
                this.logout();
            }
        }
    }

    login(credentials: any): Observable<any> {
        return this.http.post<{ success: boolean, data: { token: string, user: User } }>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                const { token, ...user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUserSubject.next(user as unknown as User);
            })
        );
    }

    register(data: any): Observable<any> {
        return this.http.post<{ success: boolean, data: { token: string, user: User } }>(`${this.apiUrl}/register`, data).pipe(
            tap(response => {
                const { token, ...user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUserSubject.next(user as unknown as User);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}
