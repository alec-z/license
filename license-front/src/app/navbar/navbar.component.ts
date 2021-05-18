import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

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
  options = ['123', '234'];
  licenses$: any;
  name = '';
  loading: boolean;
  error: any;
  constructor(private apollo: Apollo) {
  }

  ngOnInit(): void {
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
