import { Component, OnInit, ViewChild } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import * as _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = ['id', 'repo', 'branch', 'repoBranchHash'];
  displayedColumns2: string[] = ['id', 'name', 'spdxName', 'tags'];
  dataSource: any;
  dataSource2: any;
  repository = '';
  branch = '';
  scanning = false;
  repoControl = new FormControl('', [Validators.required, Validators.pattern('^(https:\/\/gitee.com/|https:\/\/github.com\/).+')]);
  branchControl = new FormControl('', [Validators.required]);
  @ViewChild('page') paginator: MatPaginator;
  @ViewChild('page2') paginator2: MatPaginator;

  getErrorMessage(): string {
    if (this.repoControl.hasError('required')) {
      return 'You must enter a value';
    }

    return this.repoControl.hasError('pattern') ? 'Not a valid repository URL' : '';
  }
  getBranchErrorMessage(): string {
    if (this.branchControl.hasError('required')) {
      return 'You must enter a value';
    }

    return '';
  }



  constructor(private apollo: Apollo, private http: HttpClient) { }

  ngOnInit(): void {
    this.apollo.query<any>({
      query: GET_VISITS,
      fetchPolicy: 'network-only'
    }).subscribe(({data, loading, error}) => {
      this.dataSource = new MatTableDataSource<any>(_(data.userVisits).map(v => v.toolResult).value());
      this.dataSource.paginator = this.paginator;
    });

    this.apollo.query<any>({
      query: GET_LICENSE_VISITS,
      fetchPolicy: 'network-only'
    }).subscribe(({data, loading, error}) => {
      this.dataSource2 = new MatTableDataSource<any>(_(data.userLicenseVisits).map(v => v.license).value());
      this.dataSource2.paginator = this.paginator2;
    });
  }

  scan(): void {
    const url = '/ci';
    this.branchControl.markAllAsTouched();
    this.repoControl.markAllAsTouched();
    if (this.branchControl.invalid || this.repoControl.invalid) {
      return;
    }
    this.scanning = true;
    const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    this.http.post(url, {repo: this.repository, branch: this.branch, action: 'license_scan_general'}, { headers }).subscribe(
      (data: any) => {
        this.scanning = false;
        window.open(data.report_url, '_blank');
      }
    );

  }


}


const GET_VISITS = gql`
    query UserVisits{
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

const GET_LICENSE_VISITS = gql`
    query UserLicenseVisits{
        userLicenseVisits {
            license {
                id,
                name,
                spdxName,
                licenseMainTags {
                    mainTag {
                        name,
                        description
                    }
                },

            }
        }
    }
`;

