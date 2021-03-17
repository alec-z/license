import { Component, Input, OnInit } from '@angular/core';
import { LicenseModel } from '../../model/license.model';

@Component({
  selector: 'app-license-list',
  templateUrl: './license-list.component.html',
  styleUrls: ['./license-list.component.scss']
})
export class LicenseListComponent implements OnInit {
  @Input() title = '';
  @Input() licenses: any[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
