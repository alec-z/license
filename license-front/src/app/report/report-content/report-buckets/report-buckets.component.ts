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
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  yAxisLabel = 'License';
  showYAxisLabel = true;
  xAxisLabel = 'Files Count';
  isLoadingResults = false;
  resultsLength = 0;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  currentLicense = '';
  @Input() listType = '';
  query: string;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.query = Searchs.LicenseTypes;
    if (this.listType === 'Copyrights') {
      this.yAxisLabel = 'Copyright';
      this.query = Searchs.Copyrights;
    }

  }

  ngAfterViewInit(): void {
    this.getBuckets().pipe(
      tap((data: any) => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        if (this.listType === 'LicenseTypes') {
          this.resultsLength = data?.aggregations?.license_types?.buckets.length;
        } else {
          this.resultsLength = data?.aggregations?.copyrights?.buckets.length;
        }
        this.resultsCountChange.emit(this.resultsLength);
        if (this.listType === 'LicenseTypes') {
          this.single = _(data.aggregations?.license_types?.buckets).map((o: any) => {
            return {name: o.key, value: o.doc_count};
          }).value();
        } else {
          this.single = _(data.aggregations?.copyrights?.buckets).map((o: any) => {
            return {name: o.key, value: o.doc_count};
          }).value();
        }
      }),
    ).subscribe();

  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    this.currentLicense = data.name;
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


