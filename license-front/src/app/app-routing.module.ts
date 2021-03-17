import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import { LicenseShowComponent } from './license-show/license-show.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'license/:id', component: LicenseShowComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
