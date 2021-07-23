import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-feature-tags-box',
  templateUrl: './feature-tags-box.component.html',
  styleUrls: ['./feature-tags-box.component.scss']
})

export class FeatureTagsBoxComponent implements OnInit, OnChanges {
  @Input() tagType = '';
  @Input() featureTags: any[];
  sortedFeatureTags: any;
  constructor() {
  }
  ngOnInit(): void {

  }

  ngOnChanges(): void {
    if (this.featureTags) {
      this.sortedFeatureTags = _.sortBy(this.featureTags, ['order']);
    }
  }

  getSubTitle(): string {
    if (this.tagType === 'can') {
      return 'Rights';
    }
    else if (this.tagType === 'cannot') {
      return 'Limitations';
    }
    else if (this.tagType === 'must') {
      return 'Obligations';
    }
    else {
      return '';
    }
  }

}
