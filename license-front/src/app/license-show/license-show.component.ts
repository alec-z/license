import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatAll, concatMap, map, pluck, tap } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';

const GET_LICENSE = gql`
    query License($id: Int!){
        license(licenseID: $id) {
            id
            name
            spdxName
            fullText
            summary
            licenseMainTags {
                mainTag {
                    name
                }
            }
            mustFeatureTags {
                id
                name
                description
            }
            canFeatureTags {
                id
                name
                description
            }
            cannotFeatureTags {
                id
                name
                description
            }
        }
    }
`;

@Component({
  selector: 'app-license-show',
  templateUrl: './license-show.component.html',
  styleUrls: ['./license-show.component.scss']
})
export class LicenseShowComponent implements OnInit {
  license: any = {};
  loading = true;
  error: any;
  id: any;

  constructor(private route: ActivatedRoute, private apollo: Apollo) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.route.params.pipe(
      pluck('id'),
      tap((id) => {
        this.id = id;
      })
    ).subscribe((id) => {
      this.apollo.query<any>({
        query: GET_LICENSE,
        variables: {id}
      }).subscribe(({data, loading, error}) => {
        this.license = data?.license;
        this.loading = loading;
        this.error = error;
      });
    });
    this.apollo.mutate<any>({
      mutation: UPDATE_USER_LICENSE_VISIT,
      variables: {id: this.id}
    }).subscribe();
  }

}

const UPDATE_USER_LICENSE_VISIT = gql`
    mutation CreateUserLicenseVisit($id: Int!){
        createUserLicenseVisit(licenseID: $id) {
            id
        }
    }
`;
