import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatAll, concatMap, map, pluck, tap } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';
import * as _ from 'lodash';


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
                    description
                }
            }
            mustFeatureTags {
                id
                name
                cnName
                order
                description
            }
            canFeatureTags {
                id
                name
                cnName
                order
                description
            }
            cannotFeatureTags {
                id
                name
                cnName
                order
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
        this.apollo.mutate<any>({
          mutation: UPDATE_USER_LICENSE_VISIT,
          variables: {id: this.id}
        }).subscribe();
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
  }

}

const UPDATE_USER_LICENSE_VISIT = gql`
    mutation CreateUserLicenseVisit($id: Int!){
        createUserLicenseVisit(licenseID: $id) {
            id
        }
    }
`;
