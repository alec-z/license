import { Component, Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-lv-meng',
  templateUrl: './lv-meng.component.html',
  styleUrls: ['./lv-meng.component.scss']
})
export class LvMengComponent implements OnInit {
  loading: boolean;
  text: string;
  wordsLength: number;
  lvMengService: LvMengService;
  result: Result;
  hasResult: boolean;

  constructor(http: HttpClient, lvMengService: LvMengService) {
    this.loading = false;
    this.text = "";
    this.wordsLength = 0;
    this.lvMengService = lvMengService;
    this.result = {} as any;
    this.hasResult = false;
   }

  ngOnInit(): void {
  }

  updateWordsLength(){
    this.wordsLength = this.text.length;
  }

  textIdentify() {
    this.loading = true;
    this.hasResult = false;
    this.lvMengService.identify(this.text).subscribe(data => {
      this.loading = false;
      console.log("返回值："+data);
      this.result = data;
      this.hasResult = true;
    });
    
  }

}

@Injectable()
export class LvMengService {
  http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }

  identify(query: string){
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    var requestBody: string = `{"licenseText": ${JSON.stringify(query)}}`;
    return this.http.post<Result>(
      "/lvmeng/textIdentify",
      requestBody,{
        headers: headers
      }
    );
  }
}

class Result {
  summary: string;
  scanResultList: ScanResult[];
}

class ScanResult {
  algorithm: string;
  licenses: License[];
}

class License {
  spdx_license_identifier: string;
  name: string;
  sim_score: string;
  sim_type: string;
}