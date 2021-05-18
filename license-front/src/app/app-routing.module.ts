import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import { LicenseShowComponent } from './license-show/license-show.component';
import { AuthorComponent } from './author/author.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthFunctionComponent } from './auth-function/auth-function.component';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'license/:id', component: LicenseShowComponent},
  {path: 'authors', component: AuthorComponent},
  {path: 'login', component: LoginComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'auth-redirect', component: AuthFunctionComponent},
  {path: 'report/:id', component: ReportComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
