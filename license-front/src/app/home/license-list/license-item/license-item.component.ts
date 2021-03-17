import { Component, Input, OnInit } from '@angular/core';
import { LicenseModel } from '../../../model/license.model';

@Component({
  selector: 'app-license-item',
  templateUrl: './license-item.component.html',
  styleUrls: ['./license-item.component.scss']
})
export class LicenseItemComponent implements OnInit {
  @Input() license: any;

  constructor() {
  }

  ngOnInit(): void {
  }

}
