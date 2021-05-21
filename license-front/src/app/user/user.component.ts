import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import * as _ from 'lodash';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = ['id', 'repo', 'branch', 'repoBranchHash'];
  dataSource: any;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.apollo.query<any>({
      query: GET_VISITS
    }).subscribe(({data, loading, error}) => {
      this.dataSource = _(data.userVisits).map(v => v.toolResult).value();
    });
  }

  goToLink(id: number): void{
    window.open('/report/' + id, '_blank');
  }

}


const GET_VISITS = gql`
    query CurrentUser{
        userVisits {
            toolResult {
                id,
                repo,
                branch,
                repoBranchHash
            }
        }
    }
`;

