export type ChartType = 'bar' | 'line' | 'scatter' | 'area' | 'pie' | 'box' | 'histogram';

export interface ChartBuilderState {
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
}

export const chartTypeOptions: Array<{ value: ChartType; label: string; description: string }> = [
  { value: 'bar', label: 'Bar', description: 'Compare grouped values' },
  { value: 'line', label: 'Line', description: 'Track change across groups' },
  { value: 'scatter', label: 'Scatter', description: 'Inspect pairwise relationships' },
  { value: 'area', label: 'Area', description: 'Show cumulative magnitude' },
  { value: 'pie', label: 'Pie', description: 'Visualize share by category' },
  { value: 'box', label: 'Box', description: 'Show distribution and outliers' },
  { value: 'histogram', label: 'Histogram', description: 'Show frequency distribution' },
];