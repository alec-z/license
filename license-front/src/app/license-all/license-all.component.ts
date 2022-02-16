import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
const LIST_LICENSES = gql`
    query listAll($page: Int!) {
        licenses(page: $page, pageSize: 15, order: "spdx_name") {
            page,
            count,
            total,
            totalPages,
            licenses {
              id,
              name,
              spdxName,
              licenseMainTags {
                mainTag {
                  name
                }
              }
              mustFeatureTags {
                id,
                name
              }
              canFeatureTags {
                id,
                name
              }
              cannotFeatureTags {
                id,
                name
              }
            }
        }
    }
`;

@Component({
  selector: 'app-license-all',
  templateUrl: './license-all.component.html',
  styleUrls: ['./license-all.component.scss']
})
export class LicenseAllComponent implements OnInit {
  page: number //当前页号
  count: number //本次返回的条目数量
  total: number //总条目数
  totalPages: number //总共有多少页
  listAllResult = {} as any
  jumpPageString: string

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.updatePage(1);
  }

  updatePage(page: number) {
    this.apollo.query<any>({
      query: LIST_LICENSES,
      variables: {page: page}
    }).subscribe((data) => {
      this.listAllResult = (<any>data).data.licenses;
      this.page = this.listAllResult.page;
      this.count = this.listAllResult.total;
      this.total = this.listAllResult.total;
      this.totalPages = this.listAllResult.totalPages;
    });
  }
  // 更新为上一页
  updatePreviousPage() {
    if(this.page == 1){
      return ;
    }
    else {
      this.updatePage(this.page - 1);
    }
  }

  // 更新为下一页
  updateNextPage() {
    if(this.page == this.totalPages){
      return ;
    }
    else {
      this.updatePage(this.page + 1);
    }
  }

  //跳至某一页
  jumpToPage(event: any) {
    if(!(event.key  === "Enter")) {
      return ;
    }
    let jumpPage: number = Number(this.jumpPageString);
    if(jumpPage < 1) {
      this.updatePage(1);
      this.jumpPageString = "";
    }
    else if(jumpPage > this.totalPages) {
      this.updatePage(this.totalPages);
      this.jumpPageString = "";
    }
    else {
      this.updatePage(jumpPage);
      this.jumpPageString = "";
    }
  }

}
