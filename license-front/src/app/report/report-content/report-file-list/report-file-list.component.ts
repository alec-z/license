import { AfterViewInit, Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import {  map, startWith, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { Searchs } from '../../../const';



@Component({
  selector: 'app-report-file-list',
  templateUrl: './report-file-list.component.html',
  styleUrls: ['./report-file-list.component.scss']
})
export class ReportFileListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['path', 'size', 'is_source', 'is_script'];
  @Input() repoBranchHash = '';
  @Input() listType = '';
  @Output() resultsCountChange = new EventEmitter<number>();

  isLoadingResults = false;
  files: any;
  resultsLength = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (this.listType === 'BadLicenseFiles' || this.listType === 'WithoutCopyrightFiles') {
      this.displayedColumns = ['path', 'size', 'is_source', 'is_script', 'license_expressions'];
    }
  }


  ngAfterViewInit(): void {
    this.files = this.paginator.page.pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.getFileList(this.paginator.pageSize, this.paginator.pageIndex);
      }),
      map((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.resultsLength = data?.hits?.total?.value;
        this.resultsCountChange.emit(this.resultsLength);
        return _(data.hits?.hits).map(o => o._source).value();
      }),

    );
  }


  getFileList(size: number, page: number): Observable<any> {

    const url = SEARCH_BASE + 'scan_file_results/_search';
    const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    let query = '';
    if (this.listType === 'WithoutLicenseFiles') {
      query = Searchs.WithoutLicenseFiles;
    }
    else if (this.listType === 'BadLicenseFiles') {
      query = Searchs.BadLicenseFiles;
    }
    else if (this.listType === 'WithoutCopyrightFiles') {
      query = Searchs.WithoutCopyrightFiles;
    }

    query = query.replace('$repoBranchHash', this.repoBranchHash)
      .replace('$from', (page * size) + '')
      .replace('$size', size + '');
    return this.http.post<any>(url, query, {
      headers
    });
  }
}

const SEARCH_BASE = '/analysis/';

