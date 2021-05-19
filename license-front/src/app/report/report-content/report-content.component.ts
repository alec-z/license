import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-content',
  templateUrl: './report-content.component.html',
  styleUrls: ['./report-content.component.scss']
})
export class ReportContentComponent implements OnInit {

  panelOpenStates = [false, false, false, false, false, false];
  lackLicenseFileCount = 0;
  badLicenseFileCount = 0;
  licenseTypeCount = 0;
  lackCopyrightFileCount = 0;
  copyrightCount = 0;

  @Input() toolResult: any;

  constructor() { }

  ngOnInit(): void {
  }

}
