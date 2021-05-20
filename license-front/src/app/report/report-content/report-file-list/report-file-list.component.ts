import {
  AfterViewInit,
  Component,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { merge, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { Searchs } from '../../../const';



@Component({
  selector: 'app-report-file-list',
  templateUrl: './report-file-list.component.html',
  styleUrls: ['./report-file-list.component.scss']
})
export class ReportFileListComponent implements OnInit, AfterViewInit, OnChanges {
  displayedColumns: string[] = ['path', 'size', 'is_source'];
  @Input() repoBranchHash = '';
  @Input() listType = '';
  @Input() currentType = '';
  @Output() resultsCountChange = new EventEmitter<number>();

  currentTypeChanged = new Subject();



  isLoadingResults = false;
  files: any;
  resultsLength = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (this.listType !== 'NoneLicenseFiles') {
      this.displayedColumns.push('license_expressions');
    }

  }


  ngAfterViewInit(): void {
    this.files = merge(this.paginator.page, this.currentTypeChanged).pipe(
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

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.currentType !== undefined) {
      this.currentTypeChanged.next('');
    }

  }


  getFileList(size: number, page: number): Observable<any> {

    const url = SEARCH_BASE + 'scan_file_results/_search';
    const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    let query = '';
    query = Searchs[this.listType];
    query = query.replace('$repoBranchHash', this.repoBranchHash)
      .replace('$from', (page * size) + '')
      .replace('$size', size + '')
      .replace('$someType', this.currentType);
    ;
    return this.http.post<any>(url, query, {
      headers
    });
  }
}

const SEARCH_BASE = '/analysis/';

