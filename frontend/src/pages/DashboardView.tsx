import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../components/layout/AppSidebar';
import { ChartControls } from '../components/charts/ChartControls';
import { ChartGallery } from '../components/charts/ChartGallery';
import type { ChartBuilderState, ChartType } from '../components/charts/chart-config';

function buildDefaultChartConfig(columns: string[]): ChartBuilderState {
  const firstColumn = columns[0] ?? '';
  const secondColumn = columns[1] ?? firstColumn;

  return {
    chartType: 'bar',
    xAxis: firstColumn,
    yAxis: secondColumn,
  };
}

export default function DashboardView() {
  const { fileSession } = useFileContext();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const defaultChartConfig = useMemo(
    () => buildDefaultChartConfig(fileSession?.metadata.columns ?? []),
    [fileSession]
  );
  const [draftConfig, setDraftConfig] = useState<ChartBuilderState>(defaultChartConfig);
  const [appliedConfig, setAppliedConfig] = useState<ChartBuilderState | null>(null);

  useEffect(() => {
    if (!fileSession) navigate('/');
  }, [fileSession, navigate]);

  useEffect(() => {
    setDraftConfig(defaultChartConfig);
    setAppliedConfig(defaultChartConfig);
    setFilters({});
  }, [defaultChartConfig]);

  const handleFiltersChange = useCallback((nextFilters: Record<string, unknown>) => {
    setFilters((previousFilters) => {
      const previousValue = JSON.stringify(previousFilters);
      const nextValue = JSON.stringify(nextFilters);
      return previousValue === nextValue ? previousFilters : nextFilters;
    });
  }, []);

  const handleChartTypeChange = (chartType: ChartType) => {
    setDraftConfig((current) => ({ ...current, chartType }));
  };

  const handleCreateCharts = () => {
    setAppliedConfig({
      chartType: draftConfig.chartType,
      xAxis: draftConfig.xAxis,
      yAxis: draftConfig.yAxis,
    });
  };

  if (!fileSession) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-transparent">
        <AppSidebar onFiltersChange={handleFiltersChange} />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-14 items-center gap-2 border-b border-slate-200/90 bg-white/90 px-3 backdrop-blur-sm md:h-20 md:gap-3 md:px-7">
            <SidebarTrigger className="shrink-0" />
            <img src="/favicon.svg" alt="Data Storyteller logo" className="hidden h-8 w-8 rounded-md bg-white p-1 ring-1 ring-slate-200 md:block" />
            <div className="min-w-0">
              <h1 className="m-0 truncate text-sm font-extrabold leading-none tracking-tight text-slate-900 md:text-2xl">Data Storyteller</h1>
              <p className="m-0 hidden pt-1 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-slate-500 md:block md:text-xs">
                Insight Dashboard
              </p>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="grid gap-6">
              <ChartControls
                columns={fileSession.metadata.columns}
                draftConfig={draftConfig}
                onChartTypeChange={handleChartTypeChange}
                onXAxisChange={(value) => setDraftConfig((current) => ({ ...current, xAxis: value }))}
                onYAxisChange={(value) => setDraftConfig((current) => ({ ...current, yAxis: value }))}
                onCreateCharts={handleCreateCharts}
                isSubmitting={false}
              />

              <ChartGallery
                appliedConfig={appliedConfig}
                fileSession={fileSession}
                filters={filters}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}