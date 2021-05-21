import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatAll, concatMap, map, pluck } from 'rxjs/operators';
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

  constructor(private route: ActivatedRoute, private apollo: Apollo) { }

  ngOnInit(): void {
    this.route.params.pipe(
      pluck('id'),
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
