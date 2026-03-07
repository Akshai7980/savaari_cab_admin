import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import ApexCharts from 'apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule
} from 'ng-apexcharts';
import { BAJAJ_CHART_OPTIONS, GROWTH_CHART_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS } from './configs/chart-options';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  colors: string[];
  grid: ApexGrid;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export default class DashboardComponent implements OnInit {
  @ViewChild('growthChart') growthChart!: ChartComponent;
  @ViewChild('bajajchart') bajajchart!: ChartComponent;

  chartOptions: Partial<ChartOptions> = GROWTH_CHART_OPTIONS;
  chartOptions1: Partial<ChartOptions> = BAJAJ_CHART_OPTIONS;

  private monthChart: ApexCharts | null = null;
  private yearChart: ApexCharts | null = null;

  ListGroup = [
    { name: 'Bajaj Finery', profit: '10% Profit', invest: '$1839.00', bgColor: 'bg-light-success', icon: 'ti ti-chevron-up', color: 'text-success' },
    { name: 'TTML', profit: '10% Loss', invest: '$100.00', bgColor: 'bg-light-danger', icon: 'ti ti-chevron-down', color: 'text-danger' },
    { name: 'Reliance', profit: '10% Profit', invest: '$200.00', bgColor: 'bg-light-success', icon: 'ti ti-chevron-up', color: 'text-success' },
    { name: 'ATGL', profit: '10% Loss', invest: '$189.00', bgColor: 'bg-light-danger', icon: 'ti ti-chevron-down', color: 'text-danger' },
    { name: 'Stolon', profit: '10% Profit', invest: '$210.00', bgColor: 'bg-light-success', icon: 'ti ti-chevron-up', color: 'text-success' }
  ];

  ngOnInit(): void {
    // Retaining small timeout for DOM rendering of charts
    setTimeout(() => this.renderMonthChart(), 500);
  }

  onNavChange(changeEvent: NgbNavChangeEvent): void {
    if (changeEvent.nextId === 1) {
      setTimeout(() => this.renderMonthChart(), 200);
    } else if (changeEvent.nextId === 2) {
      setTimeout(() => this.renderYearChart(), 200);
    }
  }

  private renderMonthChart(): void {
    const el = document.querySelector('#tab-chart-1');
    if (el) {
      this.monthChart = new ApexCharts(el, MONTH_OPTIONS);
      this.monthChart.render();
    }
  }

  private renderYearChart(): void {
    const el = document.querySelector('#tab-chart-2');
    if (el) {
      this.yearChart = new ApexCharts(el, YEAR_OPTIONS);
      this.yearChart.render();
    }
  }
}
