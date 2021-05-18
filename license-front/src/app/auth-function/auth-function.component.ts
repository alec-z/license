import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-function',
  templateUrl: './auth-function.component.html',
  styleUrls: ['./auth-function.component.scss']
})
export class AuthFunctionComponent implements OnInit {

  constructor(private cookieService: CookieService, private router: Router) { }
  ngOnInit(): void {

    const jwt = this.cookieService.get('jwt');
    if (jwt !== undefined && jwt !== null) {
      localStorage.setItem('jwt', jwt);
      this.cookieService.delete('jwt');
    }
    const accessDeniedRouter = localStorage.getItem('access_denied_url');
    console.log(accessDeniedRouter);
    if (accessDeniedRouter !== undefined && accessDeniedRouter !== null) {
      localStorage.removeItem('access_denied_url');
      this.router.navigateByUrl(accessDeniedRouter);
    }
    else {
      this.router.navigateByUrl('/');
    }
  }
}
