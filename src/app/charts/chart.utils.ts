import { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';
import { EChartsOption } from 'echarts';
import { Operation } from '../models/operation.model';

export function generateLineChart(operations: Operation[], baseAmount: number) {
  const months = Array.from(new Set(operations.map((operation) => operation.date.format('01-MM-YYYY'))))
    .map((date: string) => dayjs(date, 'DD-MM-YYYY'));
  months.sort((a: Dayjs, b: Dayjs) => a.isBefore(b) ? -1 : 1);

  const operationsForMonths: [Dayjs, Operation[], number][] = months.map((month: Dayjs) => [month, operations.filter((operation: Operation) => operation.date.isSame(month, 'months')), 0]);
  operationsForMonths.map((monthOperations: [Dayjs, Operation[], number], index: number) => {
    let previousAmount = baseAmount;
    if (index !== 0) {
      previousAmount = operationsForMonths[index - 1][2];
    }
    monthOperations[2] = monthOperations[1].reduce((prev: number, curr: Operation) => prev + curr.amount, previousAmount)
    return monthOperations;
  });

  return {
    xAxis: {
      type: 'category',
      data: months.map((month: Dayjs) => month.format('MMM YYYY'))
    },
    yAxis: {
      type: 'value'
    },
    grid: { containLabel: true },
    tooltip: {},
    series: [
      {
        data: operationsForMonths.map((monthOperations: [Dayjs, Operation[], number]) => Math.round(monthOperations[2])),
        type: 'line',
        smooth: true
      }
    ]
  } as EChartsOption;
}


export function getChartInfos(options: EChartsOption): {average: number, min: number, max: number} {
  const data = options?.series?.[0].data;
  if (data) {
    return {
      average: data.reduce((prev: number, curr: number) => prev + curr, 0) / data.length,
      min: data.reduce((prev: number, curr: number) => curr < prev ? curr : prev, Number.POSITIVE_INFINITY),
      max: data.reduce((prev: number, curr: number) => curr > prev ? curr : prev, Number.NEGATIVE_INFINITY),
    }
  }
  return {
    average: 0,
    min: 0,
    max: 0
  };
}
