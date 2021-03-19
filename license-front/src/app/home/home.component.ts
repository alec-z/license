import { Component, OnInit } from '@angular/core';
import { LicenseModel } from '../model/license.model';
import { Apollo, gql } from 'apollo-angular';
const GET_LICENSES = gql`
    {
        licenses {
            id,
            name,
            spdxName,
            free,
            licenseType {
                id,
                name
            },
            mustFeatureTags {
                id,
                name
            }
            canFeatureTags {
                id
                name
            }
            cannotFeatureTags {
                id
                name
            }
        }
    }
`;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loading = true;
  error: any;
  featuredLicenses: LicenseModel[];
  newLicenses: LicenseModel[];
  popularLicenses: LicenseModel[];
  constructor(private apollo: Apollo) {
  }

  ngOnInit(): void {
    this.apollo.watchQuery<any>({
      query: GET_LICENSES
    }).valueChanges.subscribe(({data, loading, error}) => {
      this.featuredLicenses = data?.licenses.slice(0, 6);
      this.newLicenses = data?.licenses.slice(6, 11);
      this.popularLicenses = data?.licenses.slice(6, 11);
      this.loading = loading;
      this.error = error;
    });
  }

}
