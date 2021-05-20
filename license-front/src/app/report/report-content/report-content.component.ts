import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-content',
  templateUrl: './report-content.component.html',
  styleUrls: ['./report-content.component.scss']
})
export class ReportContentComponent implements OnInit {

  panelOpenStates = [false, false, false, false, false, false];
  noneLicenseFilesCount = 0;
  badLicenseFilesCount = 0;
  licenseTypesCount = 0;
  noneCopyrightFilesCount = 0;
  copyrightCount = 0;

  @Input() toolResult: any;

  constructor() { }

  ngOnInit(): void {
  }

}
