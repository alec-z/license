import { Component, OnInit } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { Apollo, gql } from 'apollo-angular';

const OAUTH2_AUTH_URL = gql`
    query oauth2AuthURL{
        githubAuthURL: oauth2AuthURL(provider: "github")
        giteeAuthURL: oauth2AuthURL(provider: "gitee")
    }
`;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  faGithub = faGithub;
  giteeAuthURL: string;
  githubAuthURL: string;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.apollo.query<any>({
      query: OAUTH2_AUTH_URL
    }).subscribe(({data, loading, error}) => {
      this.giteeAuthURL = data?.giteeAuthURL;
      this.githubAuthURL = data?.githubAuthURL;
    });
  }

  goToLink(url: string): void{
    console.log(url);
    window.location.href = url;
  }

}
