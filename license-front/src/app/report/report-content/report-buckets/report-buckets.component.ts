import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Searchs } from '../../../const';

@Component({
  selector: 'app-report-buckets',
  templateUrl: './report-buckets.component.html',
  styleUrls: ['./report-buckets.component.scss']
})
export class ReportBucketsComponent implements OnInit, AfterViewInit {
  @Input() repoBranchHash = '';
  @Output() resultsCountChange = new EventEmitter<number>();
  // options
  single: any;

  gradient = false;


  isLoadingResults = false;
  resultsLength = 0;
  colorScheme = {
    domain: ['rgba(255, 99, 132, 0.3)',
      'rgba(54, 162, 235, 0.3)',
      'rgba(255, 206, 86, 0.3)',
      'rgba(75, 192, 192, 0.3)',
      'rgba(153, 102, 255, 0.3)',
      'rgba(255, 159, 64, 0.3)']
  };
  currentType = '';
  @Input() listType = '';
  fileListType = '';
  query: string;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.query = Searchs[this.listType];
    if (this.listType === 'LicenseTypes') {
      this.fileListType = 'SomeLicenseFiles';
    }
    else if (this.listType === 'CopyrightTypes') {
      this.fileListType = 'SomeCopyrightFiles';
    }
  }

  ngAfterViewInit(): void {
    this.getBuckets().pipe(
      tap((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.resultsLength = data?.aggregations?.aggs_types?.buckets.length;

        this.resultsCountChange.emit(this.resultsLength);

        this.single = _(data.aggregations?.aggs_types?.buckets).map((o: any) => {
          return {name: o.key, value: o.doc_count};
        }).value();

      }),
    ).subscribe();

  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    this.currentType = data.name;
  }

  getBuckets(): Observable<any> {
    const url = SEARCH_BASE + 'scan_file_results/_search';
    const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    const searchQuery = this.query.replace('$repoBranchHash', this.repoBranchHash);
    return this.http.post<any>(url, searchQuery, {
      headers
    });
  }
}


const SEARCH_BASE = '/analysis/';


