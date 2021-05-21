import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AuthService {
  private userID = 0;
  // tslint:disable-next-line:variable-name
  private _isAuthenticated = new BehaviorSubject(false);

  constructor() {
  }

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  setUser(user: any): void {
    this.userID = user.id;
    localStorage.setItem('userID', user.id + '');
    localStorage.setItem('authLogin', user.authLogin);
    localStorage.setItem('avatarUrl', user.avatarUrl);
    this._isAuthenticated.next(true);
  }

  logout(): void {
    localStorage.removeItem('userID');
    localStorage.removeItem('login');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('jwt');
    this.userID = 0;
    this._isAuthenticated.next(false);
  }
}
