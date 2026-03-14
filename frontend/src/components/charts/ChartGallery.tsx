import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PlotlyChart } from './PlotlyChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import { chartTypeOptions, type ChartBuilderState } from './chart-config';

interface ChartGalleryProps {
  appliedConfig: ChartBuilderState | null;
  fileSession?: {
    file_id: string;
    filename: string;
  };
  filters?: Record<string, unknown>;
}

export function ChartGallery({ appliedConfig, fileSession, filters = {} }: ChartGalleryProps) {
  if (!appliedConfig) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/70">
        <CardContent className="flex h-[360px] items-center justify-center px-8 text-center text-sm font-medium text-slate-500">
          Choose chart options, then click Create Charts to render your dashboard.
        </CardContent>
      </Card>
    );
  }

  const chartMeta = chartTypeOptions.find((option) => option.value === appliedConfig.chartType);

  return (
    <Card
      key={`${appliedConfig.chartType}-${appliedConfig.xAxis}-${appliedConfig.yAxis}`}
      className="border-slate-200/80 bg-white/88 shadow-[0_18px_42px_rgba(18,26,64,0.12)]"
    >
      <CardHeader className="border-b border-slate-200/80 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">{chartMeta?.label} Chart</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          {appliedConfig.yAxis} by {appliedConfig.xAxis}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[380px] md:h-[460px]">
          <ChartErrorBoundary fallbackTitle="This chart configuration could not be rendered.">
            <PlotlyChart
              chartType={appliedConfig.chartType}
              xAxis={appliedConfig.xAxis}
              yAxis={appliedConfig.yAxis}
              fileSession={fileSession}
              filters={filters}
            />
          </ChartErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}