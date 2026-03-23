import { useEffect, useState, useCallback, useRef } from 'react';
import type { ChartType } from './chart-config';
import Plotly from 'plotly.js/dist/plotly';

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
  const [chartData, setChartData] = useState<any>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  const generateChart = useCallback(async () => {
    if (!fileSession) return;

    // Validate required parameters
    if (!fileSession.file_id || !fileSession.filename || !chartType || !xAxis || !yAxis) {
      setError('Missing required parameters: file_id, filename, chart_type, x_axis, and y_axis must all be provided');
      return;
    }

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
        let errorMsg = 'Failed to generate chart';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (_) {
          errorMsg = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      if (!result.chart_data) {
        console.warn('No chart_data in response:', result);
        throw new Error('Backend did not return chart data');
      }
      if (!result.chart_data.data || !Array.isArray(result.chart_data.data)) {
        console.warn('Invalid chart data structure:', result.chart_data);
        throw new Error('Invalid chart data format from backend');
      }
      if (!result.chart_data.layout) {
        console.warn('No layout in chart data:', result.chart_data);
        throw new Error('Chart configuration is incomplete');
      }
      console.log('Chart data received:', result.chart_data);
      setChartData(result.chart_data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Chart generation error:', errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [fileSession, filters, chartType, xAxis, yAxis]);

  useEffect(() => {
    generateChart();
  }, [generateChart]);

  // Render chart with Plotly when data is available
  useEffect(() => {
    if (chartData && plotRef.current) {
      try {
        const layout = {
          ...(chartData.layout || {}),
          autosize: true,
        };
        Plotly.newPlot(plotRef.current, chartData.data || [], layout);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to render chart';
        setError(errorMessage);
        console.error('Plotly rendering error:', err);
      }
    }
  }, [chartData]);

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

  if (isLoading || !chartData) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Generating chart...</p>
        </div>
      </div>
    );
  }

  return <div ref={plotRef} className="w-full h-full" />
}

