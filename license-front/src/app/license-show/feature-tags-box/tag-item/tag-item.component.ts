import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag-item',
  templateUrl: './tag-item.component.html',
  styleUrls: ['./tag-item.component.scss']
})
export class TagItemComponent implements OnInit {
  @Input() featureTag: any;
  expanded = false;
  constructor() { }

  ngOnInit(): void {
  }

}
