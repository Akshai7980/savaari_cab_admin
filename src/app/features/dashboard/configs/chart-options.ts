import { ChartOptions } from '../dashboard.component';

export const GROWTH_CHART_OPTIONS: Partial<ChartOptions> = {
    series: [
        {
            name: 'Investment',
            data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75]
        },
        {
            name: 'Loss',
            data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75]
        },
        {
            name: 'Profit',
            data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10]
        },
        {
            name: 'Maintenance',
            data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0]
        }
    ],
    dataLabels: {
        enabled: false
    },
    chart: {
        type: 'bar',
        height: 480,
        stacked: true,
        toolbar: {
            show: true
        }
    },
    colors: ['#90caf9', '#1e88e5', '#673ab7', '#ede7f6'],
    responsive: [
        {
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0
                }
            }
        }
    ],
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '50%'
        }
    },
    xaxis: {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    grid: {
        strokeDashArray: 4
    },
    tooltip: {
        theme: 'dark'
    }
};

export const BAJAJ_CHART_OPTIONS: Partial<ChartOptions> = {
    chart: {
        type: 'area',
        height: 95,
        stacked: true,
        sparkline: {
            enabled: true
        }
    },
    colors: ['#673ab7'],
    stroke: {
        curve: 'smooth',
        width: 1
    },
    series: [
        {
            data: [0, 15, 10, 50, 30, 40, 25]
        }
    ]
};

export const MONTH_OPTIONS: any = {
    chart: {
        type: 'line',
        height: 90,
        sparkline: {
            enabled: true
        }
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#FFF'],
    stroke: {
        curve: 'smooth',
        width: 3
    },
    series: [
        {
            name: 'series1',
            data: [45, 66, 41, 89, 25, 44, 9, 54]
        }
    ],
    yaxis: {
        min: 5,
        max: 95
    },
    tooltip: {
        theme: 'dark',
        fixed: {
            enabled: false
        },
        x: {
            show: false
        },
        y: {
            title: {
                formatter: () => 'Total Earning'
            }
        },
        marker: {
            show: false
        }
    }
};

export const YEAR_OPTIONS: any = {
    chart: {
        type: 'line',
        height: 90,
        sparkline: {
            enabled: true
        }
    },
    dataLabels: {
        enabled: false
    },
    colors: ['#FFF'],
    stroke: {
        curve: 'smooth',
        width: 3
    },
    series: [
        {
            name: 'series1',
            data: [35, 44, 9, 54, 45, 66, 41, 69]
        }
    ],
    yaxis: {
        min: 5,
        max: 95
    },
    tooltip: {
        theme: 'dark',
        fixed: {
            enabled: false
        },
        x: {
            show: false
        },
        y: {
            title: {
                formatter: () => 'Total Earning'
            }
        },
        marker: {
            show: false
        }
    }
};
