import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import { BooleanValueNode } from 'graphql';
import {trigger, state, style, animate, transition} from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NONE_TYPE } from '@angular/compiler';

@Component({
  selector: 'app-compatiable-table',
  templateUrl: './compatiable-table.component.html',
  styleUrls: ['./compatiable-table.component.scss'],
  animations: [
    trigger('dropdown-animation', [
      state('show', style({
        height: '300px',
        opacity: 1,
      })),
      state('hide', style({
        height: '0',
        opacity: 0.5,
      })),
      transition('show => hide', [
        animate('0.3s')
      ]),
      transition('hide => show', [
        animate('0.3s')
      ]),
    ]),
  ]
})
export class CompatiableTableComponent implements OnInit {
  license_start = "选择要组合的许可证";
  license_end = "选择你的项目使用的许可证";
  usage = "source code";

  license_start_result: string;
  license_end_result: string;
  result: string;
  remarks: string;

  hasResult: boolean;
  http: HttpClient;
  //结果的三种类型，显示对应颜色
  isConflict: boolean;
  isWarning: boolean;
  isCompatible: boolean;
  
  //下拉列表里的license条目
  copyleftList: string[];
  permissiveList: string[];
  publicDomainList: string[];

  //两个下拉列表是否展示
  showDropdownMenu1: boolean;
  showDropdownMenu2: boolean;
  
  //过滤选项的字符串
  filter1: string;
  filter2: string;

  constructor(http: HttpClient,public el: ElementRef) {
    this.http = http;
    this.hasResult = false;
  }

  ngOnInit(): void {
    this.copyleftList = [
      "Artistic-2.0",
      "LPL-1.02",
      "CC-BY-SA-4.0",
      "CDDL-1.0",
      "CECILL-2.1",
      "CPAL-1.0",
      "CPL-1.0",
      "IPL-1.0",
      "Nokia",
      "EPL-1.0",
      "EPL-2.0",
      "EUPL-1.1",
      "EUPL-1.2",
      "LPPL-1.3c",
      "MPL-2.0",
      "MS-RL",
      "OSL-3.0",
      "RPSL-1.0",
      "Sleepycat",
      "SISSL",
      "SPL-1.0",
      "Vim",
      "LGPL-2.1-only",
      "LGPL-2.1+",
      "LGPL-3.0-only",
      "GPL-2.0-only",
      "GPL-2.0-or-later",
      "GPL-3.0-only",
      "GPL-3.0-or-later",
      "AGPL-3.0-only"
    ];
    this.permissiveList = [
      "0BSD",
      "AFL-3.0",
      "Apache-2.0",
      "BSD-2-Clause",
      "BSD-3-Clause",
      "BSD-3-Clause-Clear",
      "BSD-4-Clause",
      "CC-BY-4.0",
      "BSL-1.0",
      "ECL-2.0",
      "EFL-2.0",
      "EUDatagrid",
      "HPND",
      "Intel",
      "ISC",
      "MIT",
      "MIT-0",
      "MS-PL",
      "MulanPSL-2.0",
      "NCSA",
      "OFL-1.1",
      "PHP-3.01",
      "PostgreSQL",
      "UPL-1.0",
      "Zlib",
      "ZPL-2.0",
      "ZPL-2.1"
    ];
    this.publicDomainList = ["CC0-1.0","Unlicense","WTFPL"];
    this.showDropdownMenu1 = false;
    this.showDropdownMenu2 = false;
    //点击页面其它地方，收起下拉列表
    document.addEventListener('click', (e) => {
      if (!this.el.nativeElement.querySelectorAll('.select-license')[0].contains(e.target)) {
        this.showDropdownMenu1 = false;
      }
    });
    document.addEventListener('click', (e) => {
      if (!this.el.nativeElement.querySelectorAll('.select-license')[1].contains(e.target)) {
        this.showDropdownMenu2 = false;
      }
    });
  }
  
  getCompatability(){
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    this.http.get<any>(
      `/search_conflict?license_start=${this.license_start}&license_end=${this.license_end}&usage=${this.usage}`
    ).subscribe(data => {
      this.hasResult = true;
      this.license_start_result = data.license_start;
      this.license_end_result = data.license_end;
      this.result = data.result;
      this.remarks = data.remarks;
      this.isConflict = (<string>data.result).startsWith("冲突");
      this.isWarning = (<string>data.result).startsWith("相容，但不兼容");
      this.isCompatible = (<string>data.result).startsWith("兼容");
    });
  }

  reverseDropDownMenuState(num: number) {
    if(num == 1) {
      this.showDropdownMenu1 = !this.showDropdownMenu1;
    }
    else {
      this.showDropdownMenu2 = !this.showDropdownMenu2;
    }
  }

  reverseDropDownMenuState_test(num: number,$event: Event) {
    console.log(`reverse dropdownMenu ${num}`);
    if(num == 1) {
      console.log($event);
      this.showDropdownMenu1 = !this.showDropdownMenu1;
    }
    else {
      this.showDropdownMenu2 = !this.showDropdownMenu2;
    }
  }

  displayNoneDropdownMenu(num: number) {
    //如果不显示dropdown-menu1，那么将其置为display:none
    if (num==1 && !this.showDropdownMenu1) {
      this.el.nativeElement.querySelectorAll('.dropdown-menu')[0].style.display='none';
    }
    if (num==2 && !this.showDropdownMenu2) {
      this.el.nativeElement.querySelectorAll('.dropdown-menu')[1].style.display='none';
    }
  }

  displayBlockDropdownMenu(num: number) {
    //之前置为display:none后，如果发生动画，需要进行display，否则还是之前的display:none状态
    if (num == 1) {
      this.el.nativeElement.querySelectorAll('.dropdown-menu')[0].style.display='block';
    }
    if (num == 2) {
      this.el.nativeElement.querySelectorAll('.dropdown-menu')[1].style.display='block';
    }
  }

  containsIgnoreCase(licenseName: string, filter: string) {
    return licenseName.search(new RegExp(filter, 'i')) != -1;
  }
  
  focusToInput(num: number) {
    console.log(111);
    console.log(document.activeElement)
    this.reverseDropDownMenuState(num)
    document.getElementById(`filter${num}`)?.focus();
    console.log(document.activeElement)
  }

  //测试方法，未发现调用时可以直接删除
  test(s: string, $event: Event) {
    console.log($event.target);
    console.log("test function called: value: "+s);
  }
}
