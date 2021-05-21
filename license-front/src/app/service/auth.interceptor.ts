import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    const jwt = localStorage.getItem('jwt');
    let res: Observable<HttpEvent<any>>;
    let cloned;
    if (jwt) {
      cloned = req.clone({
        headers: req.headers.set('Authorization',
          'Bearer ' + jwt)
      });
    }
    else {
      cloned = req;
    }
    res =  next.handle(cloned).pipe(tap((event) => {
      if (event instanceof HttpResponse) {
        const resp = event as HttpResponse<any>;
        if ('errors' in resp.body) {
          const errors = resp.body.errors;
          if (errors.some((e: any) => e.message === 'Access denied')) {
            const accessDeniedUrl = localStorage.getItem('access_denied_url');
            if (accessDeniedUrl === undefined || accessDeniedUrl === null || accessDeniedUrl === '') {
              localStorage.setItem('access_denied_url', this.router.url);
            }
            this.router.navigate(['login']);
          }
        } else {
          const newJWT = resp.headers.get('new-jwt');
          if (newJWT !== undefined && newJWT !== null) {
            localStorage.setItem('jwt', newJWT);
          }
        }
      }
    }));
    return res;
  }
}
