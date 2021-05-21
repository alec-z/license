import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-auth-function',
  templateUrl: './auth-function.component.html',
  styleUrls: ['./auth-function.component.scss']
})
export class AuthFunctionComponent implements OnInit {

  constructor(private cookieService: CookieService, private router: Router,  private apollo: Apollo, private authService: AuthService) { }
  ngOnInit(): void {

    const jwt = this.cookieService.get('jwt');
    if (jwt !== undefined && jwt !== null) {
      localStorage.setItem('jwt', jwt);
      this.cookieService.delete('jwt');
    }
    const accessDeniedRouter = localStorage.getItem('access_denied_url');
    console.log(accessDeniedRouter);


    this.apollo.query<any>({
      query: GET_CURRENT_USER
    }).subscribe(({data, loading, error}) => {
      this.authService.setUser(data.currentUser);
      if (accessDeniedRouter !== undefined && accessDeniedRouter !== null) {
        localStorage.removeItem('access_denied_url');
        this.router.navigateByUrl(accessDeniedRouter);
      }
      else {
        this.router.navigateByUrl('/');
      }
    });



  }
}

const GET_CURRENT_USER = gql`
    query CurrentUser{
        currentUser {
            id
            authType
            authLogin
            avatarUrl
        }
    }
`;
