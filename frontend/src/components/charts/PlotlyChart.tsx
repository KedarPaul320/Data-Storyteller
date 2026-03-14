import { useEffect, useState, useCallback, useRef } from 'react';
import 'plotly.js/dist/plotly';
import type { ChartType } from './chart-config';

interface PlotlyChartProps {
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  fileSession?: {
    file_id: string;
    filename: string;
  };
  filters?: Record<string, unknown>;
}

export function PlotlyChart({
  chartType,
  xAxis,
  yAxis,
  fileSession,
  filters = {},
}: PlotlyChartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateChart = useCallback(async () => {
    if (!fileSession || !containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/chart/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileSession.file_id,
          filename: fileSession.filename,
          filters,
          chart_type: chartType,
          x_axis: xAxis,
          y_axis: yAxis,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chart');
      }

      const result = await response.json();

      // Render the Plotly chart
      if (result.chart_data && containerRef.current) {
        const Plotly = (window as any).Plotly;
        Plotly.newPlot(
          containerRef.current,
          result.chart_data.data,
          result.chart_data.layout,
          { responsive: true }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Chart generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileSession, filters, chartType, xAxis, yAxis]);

  useEffect(() => {
    generateChart();
  }, [generateChart]);

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <p className="text-red-600 text-sm font-medium">Error generating chart</p>
          <p className="text-red-500 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Generating chart...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

