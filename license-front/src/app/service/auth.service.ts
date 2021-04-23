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

  saveUserDate(id: number, token: string): void {
    localStorage.setItem('userID', id + '');
    localStorage.setItem('userToken', token);
    this.setUserID(id);
  }

  setUserID(id: number): void {
    this.userID = id;
    this._isAuthenticated.next(true);
  }

  logout(): void {
    localStorage.removeItem('userID');
    localStorage.removeItem('userToken');
    this.userID = 0;
    this._isAuthenticated.next(false);
  }

  autoLogin(): void {
    const id = localStorage.getItem('userID');
    if (id) {
      this.setUserID(parseInt(id, 10));
    }
  }

}
