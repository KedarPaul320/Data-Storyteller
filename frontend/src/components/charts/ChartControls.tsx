import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { chartTypeOptions, type ChartBuilderState, type ChartType } from './chart-config';

interface ChartControlsProps {
  columns: string[];
  draftConfig: ChartBuilderState;
  onChartTypeChange: (chartType: ChartType) => void;
  onXAxisChange: (value: string) => void;
  onYAxisChange: (value: string) => void;
  onCreateCharts: () => void;
  isSubmitting: boolean;
}

export function ChartControls({
  columns,
  draftConfig,
  onChartTypeChange,
  onXAxisChange,
  onYAxisChange,
  onCreateCharts,
  isSubmitting,
}: ChartControlsProps) {
  const canCreate = Boolean(draftConfig.chartType) && Boolean(draftConfig.xAxis) && Boolean(draftConfig.yAxis);

  return (
    <Card className="border-slate-200/80 bg-white/90 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
      <CardHeader className="border-b border-slate-200/80 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">Chart Builder</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Choose chart varieties and axes, then create charts when you are ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <section className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Chart</span>
            <select
              value={draftConfig.chartType}
              onChange={(event) => onChartTypeChange(event.target.value as ChartType)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {chartTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              {chartTypeOptions.find((option) => option.value === draftConfig.chartType)?.description}
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">X axis</span>
            <select
              value={draftConfig.xAxis}
              onChange={(event) => onXAxisChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Y axis</span>
            <select
              value={draftConfig.yAxis}
              onChange={(event) => onYAxisChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="flex items-center justify-between gap-4 border-t border-slate-200/80 pt-5">
          <p className="text-xs text-slate-500">Charts can render without filters. Filter changes refresh existing charts automatically.</p>
          <Button
            onClick={onCreateCharts}
            disabled={!canCreate || isSubmitting}
            className="h-11 min-w-40 bg-blue-700 font-semibold text-white hover:bg-blue-800"
          >
            {isSubmitting ? 'Preparing...' : 'Create Charts'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}