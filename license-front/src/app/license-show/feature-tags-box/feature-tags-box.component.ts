import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-feature-tags-box',
  templateUrl: './feature-tags-box.component.html',
  styleUrls: ['./feature-tags-box.component.scss']
})
export class FeatureTagsBoxComponent implements OnInit {
  @Input() tagType = '';
  @Input() featureTags: any[];
  constructor() { }

  ngOnInit(): void {
  }

}
