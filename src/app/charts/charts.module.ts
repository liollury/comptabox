import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import { AccountChartComponent } from './account-chart/account-chart.component';
import { routes } from './charts.routes';
import { AccountTypeChartComponent } from './account-type-chart/account-type-chart.component';



@NgModule({
  declarations: [
    AccountChartComponent,
    AccountTypeChartComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ]
})
export class ChartsModule { }
