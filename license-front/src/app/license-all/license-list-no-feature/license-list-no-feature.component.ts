import { Component, Input, OnInit } from '@angular/core';
import { LicenseModel } from '../../model/license.model';

@Component({
  selector: 'app-license-list-no-feature',
  templateUrl: './license-list-no-feature.component.html',
  styleUrls: ['./license-list-no-feature.component.scss']
})
export class LicenseListNoFeatureComponent implements OnInit {
  @Input() title = '';
  @Input() licenses: any[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
