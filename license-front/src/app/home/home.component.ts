import { Component, OnInit } from '@angular/core';
import { LicenseModel } from '../model/license.model';
import { Apollo, gql } from 'apollo-angular';
const LIST_LICENSES = gql`
    query listLicensesByType($indexType: String!){
        listLicensesByType(indexType: $indexType, limit: 5) {
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
    let indexType = 'featured';
    this.apollo.watchQuery<any>({
      query: LIST_LICENSES,
      variables: {indexType}
    }).valueChanges.subscribe(({data, loading, error}) => {
      this.featuredLicenses = data?.listLicensesByType;
      this.loading = loading;
      this.error = error;
    });

    indexType = 'new';
    this.apollo.watchQuery<any>({
      query: LIST_LICENSES,
      variables: {indexType}
    }).valueChanges.subscribe(({data, loading, error}) => {
      this.newLicenses = data?.listLicensesByType;
      this.loading = loading;
      this.error = error;
    });

    indexType = 'popular';
    this.apollo.watchQuery<any>({
      query: LIST_LICENSES,
      variables: {indexType}
    }).valueChanges.subscribe(({data, loading, error}) => {
      this.popularLicenses = data?.listLicensesByType;
      this.loading = loading;
      this.error = error;
    });

  }

}
