import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../service/auth.service';

const LIST_LICENSES = gql`
    query listLicenseBytName($name: String!){
        listLicensesByName(name: $name, limit: 8) {
            id,
            name,
            spdxName
        }
    }
`;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  licenses$: any;
  name = '';
  loading: boolean;
  error: any;
  login = false;
  avatarUrl: string | null;
  constructor(private apollo: Apollo, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.isAuthenticated.subscribe((data: boolean) => {
        if (data) {
          this.login = true;
          this.avatarUrl = localStorage.getItem('avatarUrl');
        } else {
          const jwt = localStorage.getItem('JWT');
          if (jwt === undefined || jwt === null || jwt ==='') {
            this.login = false;
            this.avatarUrl = localStorage.getItem('avatarUrl');
          }
        }
      }
    );
  }

  filterName(name: any): void {
    this.name = name;
    this.licenses$ = this.apollo.query<any>({
      query: LIST_LICENSES,
      variables: { name }
    }).pipe(
      map((({data, loading, error}) => {
      this.loading = loading;
      this.error = error;
      return data?.listLicensesByName;
    })));
  }

  goToLink(url: string): void{
    window.open(url, '_blank');
  }
}
