import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';

const GET_TOOL_RESULT = gql`
    query ToolResult($id: Int!){
        toolResult(toolResultID: $id) {
            repo
            branch
            repoBranchHash
            fileCount
            scanedFileCount
            beginAt
            finishAt
            tool {
                id
                stepNumber
                scanRate
            }
        }
    }
`;


const GET_TOOL_RESULT2 = gql`
    query ToolResult($id: Int!){
        toolResult(toolResultID: $id) {
            outputRawJson
        }
    }
`;

const UPDATE_USER_VISIT = gql`
    mutation CreateUserVisit($id: Int!){
        createUserVisit(toolResultID: $id) {
            id
        }
    }
`;

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})

export class ReportComponent implements AfterViewInit {
  panelOpenState = false;

  @ViewChild('download') download: ElementRef;

  toolResult: any = {};
  loading: boolean;
  error: any;
  id: number;
  complete = false;
  fileCount = -1;
  scanedFileCount = -1;
  remainingSeconds = -1;

  remainingStr = '';
  currentStep = 0;
  timer = -1;

  constructor(private activeRoute: ActivatedRoute, private apollo: Apollo, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.id = this.activeRoute.snapshot.params.id;
    this.apollo.mutate<any>({
      mutation: UPDATE_USER_VISIT,
      variables: {id: this.id}
    }).subscribe();

    this.refresh();
    if (this.timer !== -1) {
      clearInterval(this.timer);
    }
    if (!this.complete) {
      this.timer = setInterval(() => {
        this.countDown.call(this);
      }, 1000);
    }

  }

  countDown(): void {
    if (this.remainingSeconds > 5) {
      this.remainingSeconds --;
    }
    if (this.remainingSeconds >= 1) {
      this.remainingStr = Math.floor(this.remainingSeconds / 60) + '分钟 ' + this.remainingSeconds % 60 + '秒';
    } else {
      this.remainingStr = '计算等待时间中...';
    }
  }

  refresh(): void {
    this.apollo.query<any>({
      query: GET_TOOL_RESULT,
      variables: {id: this.id},
      fetchPolicy: 'network-only'
    }).subscribe(({data, loading, error}) => {
      this.toolResult = data?.toolResult;
      this.loading = loading;
      this.error = error;
      if (this.toolResult.finishAt === undefined || this.toolResult.finishAt === null || this.toolResult.finishAt === '') {
        let nextRequestInterval = 3000;
        if (this.toolResult.fileCount !== 0) {
          this.fileCount = this.toolResult.fileCount;
          this.scanedFileCount = this.toolResult.scanedFileCount;
          let fileRemainCount = this.fileCount - this.scanedFileCount
          if (fileRemainCount < 1) {
            fileRemainCount = 1;
          }
          this.remainingSeconds = Math.ceil(fileRemainCount / this.toolResult.tool.scanRate);
          this.countDown();
          let remainStep = this.toolResult.tool.stepNumber + 1 - this.currentStep;
          if (remainStep <= 0) {
            remainStep = 1;
          }
          nextRequestInterval = (this.fileCount - this.scanedFileCount) / remainStep / this.toolResult.tool.scanRate * 1000;
          nextRequestInterval = Math.floor(nextRequestInterval);
          this.currentStep += 1;
        }
        if (nextRequestInterval < 3000) {
          nextRequestInterval = 3000;
        }
        if (nextRequestInterval > 3000 * 20) {
          nextRequestInterval = 3000 * 20;
        }
        console.log(nextRequestInterval);
        setTimeout(() => { this.refresh.call(this); }, nextRequestInterval);
      }
      else {
        this.complete = true;

        this.apollo.query<any>({
          query: GET_TOOL_RESULT2,
          variables: {id: this.id},
          fetchPolicy: 'network-only'
        }).subscribe((res) => {
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(res.data.toolResult?.outputRawJson);
          this.download.nativeElement.setAttribute('href', dataStr);
        });
      }
    });

  }

  refreshPage(): void {
    location.reload();
  }
}
