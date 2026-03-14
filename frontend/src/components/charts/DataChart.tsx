import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import type { ChartType } from './chart-config';

interface DataChartProps {
  data: Record<string, unknown>[];
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
}

const palette = ['#1D4ED8', '#F59E0B', '#F97316', '#0F766E', '#7C3AED', '#DC2626'];

function toNumericValue(value: unknown) {
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : null;
}

function toDisplayValue(value: unknown) {
  const normalized = String(value ?? 'Unknown').trim();
  return normalized.length > 0 ? normalized : 'Unknown';
}

function hasNumericValues(data: Record<string, unknown>[], column: string) {
  return data.some((row) => toNumericValue(row[column]) !== null);
}

function buildGroupedSeries(data: Record<string, unknown>[], xAxis: string, yAxis: string, useNumericY: boolean) {
  const grouped = new Map<string, { label: string; value: number; sortValue: number | null; order: number }>();

  data.forEach((row, index) => {
    const label = toDisplayValue(row[xAxis]);
    const numericX = toNumericValue(row[xAxis]);
    const existing = grouped.get(label);

    if (useNumericY) {
      const numericValue = toNumericValue(row[yAxis]);
      if (numericValue === null) {
        return;
      }

      grouped.set(label, {
        label,
        value: (existing?.value ?? 0) + numericValue,
        sortValue: existing?.sortValue ?? numericX,
        order: existing?.order ?? index,
      });
      return;
    }

    grouped.set(label, {
      label,
      value: (existing?.value ?? 0) + 1,
      sortValue: existing?.sortValue ?? numericX,
      order: existing?.order ?? index,
    });
  });

  return Array.from(grouped.values()).sort((left, right) => {
    if (left.sortValue !== null && right.sortValue !== null) {
      return left.sortValue - right.sortValue;
    }

    return left.order - right.order;
  });
}

function buildScatterSeries(data: Record<string, unknown>[], xAxis: string, yAxis: string) {
  const xCategoryIndex = new Map<string, number>();
  const yCategoryIndex = new Map<string, number>();
  const xTickLabels = new Map<number, string>();
  const yTickLabels = new Map<number, string>();

  const points = data.map((row) => {
    const rawX = row[xAxis];
    const rawY = row[yAxis];

    const numericX = toNumericValue(rawX);
    const numericY = toNumericValue(rawY);
    const xDisplay = toDisplayValue(rawX);
    const yDisplay = toDisplayValue(rawY);

    if (numericX !== null && numericY !== null) {
      return { x: numericX, y: numericY, xDisplay, yDisplay };
    }

    let plottedX = numericX;
    if (plottedX === null) {
      const key = xDisplay;
      if (!xCategoryIndex.has(key)) {
        const nextValue = xCategoryIndex.size + 1;
        xCategoryIndex.set(key, nextValue);
        xTickLabels.set(nextValue, key);
      }
      plottedX = xCategoryIndex.get(key) ?? 0;
    }

    let plottedY = numericY;
    if (plottedY === null) {
      const key = yDisplay;
      if (!yCategoryIndex.has(key)) {
        const nextValue = yCategoryIndex.size + 1;
        yCategoryIndex.set(key, nextValue);
        yTickLabels.set(nextValue, key);
      }
      plottedY = yCategoryIndex.get(key) ?? 0;
    }

    return { x: plottedX, y: plottedY, xDisplay, yDisplay };
  });

  return {
    points,
    xTickLabels,
    yTickLabels,
  };
}

function ChartTooltip({ active, payload, label, chartType, xAxis, yAxis, yAxisLabel }: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: Record<string, unknown> }>;
  label?: string | number;
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  yAxisLabel: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  if (chartType === 'scatter') {
    const point = payload[0]?.payload;

    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold text-slate-900">{xAxis}: {String(point?.xDisplay ?? '')}</p>
        <p className="text-slate-700">{yAxis}: {String(point?.yDisplay ?? '')}</p>
      </div>
    );
  }

  const value = payload[0]?.value;

  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-slate-900">{xAxis}: {String(label ?? '')}</p>
      <p className="text-slate-700">{yAxisLabel}: {typeof value === 'number' ? value.toLocaleString() : String(value ?? '')}</p>
    </div>
  );
}

export default function DataChart({ data, chartType, xAxis, yAxis }: DataChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-base font-semibold text-slate-600">No data available for the current filters.</div>;
  }

  if (!xAxis || !yAxis) {
    return <div className="flex h-full items-center justify-center text-base font-semibold text-slate-600">No chartable columns available.</div>;
  }

  const maxRecords = chartType === 'scatter' ? 5000 : 20000;
  const workingData = useMemo(
    () => (data.length > maxRecords ? data.slice(0, maxRecords) : data),
    [data, maxRecords],
  );

  const yAxisIsNumeric = useMemo(
    () => hasNumericValues(workingData, yAxis),
    [workingData, yAxis],
  );

  const groupedSeries = useMemo(
    () => (chartType === 'scatter' ? [] : buildGroupedSeries(workingData, xAxis, yAxis, yAxisIsNumeric)),
    [chartType, workingData, xAxis, yAxis, yAxisIsNumeric],
  );

  const scatterSeries = useMemo(
    () => (chartType === 'scatter' ? buildScatterSeries(workingData, xAxis, yAxis) : { points: [], xTickLabels: new Map<number, string>(), yTickLabels: new Map<number, string>() }),
    [chartType, workingData, xAxis, yAxis],
  );

  if (chartType !== 'scatter' && groupedSeries.length === 0) {
    return <div className="flex h-full items-center justify-center text-base font-semibold text-slate-600">No valid records were found for the selected axes.</div>;
  }

  if (chartType === 'scatter' && scatterSeries.points.length === 0) {
    return <div className="flex h-full items-center justify-center text-base font-semibold text-slate-600">No valid records were found for the selected axes.</div>;
  }

  const yAxisLabel = chartType === 'scatter' ? yAxis : (yAxisIsNumeric ? yAxis : 'Count');

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={groupedSeries} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
          <CartesianGrid stroke="rgba(34,50,85,0.09)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#273763', fontSize: 12 }} interval={0} angle={groupedSeries.length > 8 ? -20 : 0} textAnchor={groupedSeries.length > 8 ? 'end' : 'middle'} height={groupedSeries.length > 8 ? 64 : 36} label={{ value: xAxis, position: 'insideBottom', offset: -4, fill: '#233254' }} />
          <YAxis tick={{ fill: '#273763', fontSize: 12 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#233254' }} />
          <Tooltip content={<ChartTooltip chartType={chartType} xAxis={xAxis} yAxis={yAxis} yAxisLabel={yAxisLabel} />} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {groupedSeries.map((item, index) => (
              <Cell key={`${item.label}-${index}`} fill={palette[index % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart data={groupedSeries} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
          <CartesianGrid stroke="rgba(34,50,85,0.09)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#273763', fontSize: 12 }} interval={0} angle={groupedSeries.length > 8 ? -20 : 0} textAnchor={groupedSeries.length > 8 ? 'end' : 'middle'} height={groupedSeries.length > 8 ? 64 : 36} label={{ value: xAxis, position: 'insideBottom', offset: -4, fill: '#233254' }} />
          <YAxis tick={{ fill: '#273763', fontSize: 12 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#233254' }} />
          <Tooltip content={<ChartTooltip chartType={chartType} xAxis={xAxis} yAxis={yAxis} yAxisLabel={yAxisLabel} />} />
          <Line type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', stroke: '#1D4ED8' }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart data={groupedSeries} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
          <defs>
            <linearGradient id="chartAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(34,50,85,0.09)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#273763', fontSize: 12 }} interval={0} angle={groupedSeries.length > 8 ? -20 : 0} textAnchor={groupedSeries.length > 8 ? 'end' : 'middle'} height={groupedSeries.length > 8 ? 64 : 36} label={{ value: xAxis, position: 'insideBottom', offset: -4, fill: '#233254' }} />
          <YAxis tick={{ fill: '#273763', fontSize: 12 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#233254' }} />
          <Tooltip content={<ChartTooltip chartType={chartType} xAxis={xAxis} yAxis={yAxis} yAxisLabel={yAxisLabel} />} />
          <Area type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={3} fill="url(#chartAreaFill)" />
        </AreaChart>
      );
    }

    if (chartType === 'pie') {
      return (
        <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
          <Tooltip content={<ChartTooltip chartType={chartType} xAxis={xAxis} yAxis={yAxis} yAxisLabel={yAxisLabel} />} />
          <Legend />
          <Pie data={groupedSeries} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius="78%" innerRadius="38%" paddingAngle={2}>
            {groupedSeries.map((item, index) => (
              <Cell key={`${item.label}-${index}`} fill={palette[index % palette.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }

    return (
      <ScatterChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
        <CartesianGrid stroke="rgba(34,50,85,0.09)" />
        <XAxis
          type="number"
          dataKey="x"
          tick={{ fill: '#273763', fontSize: 12 }}
          tickFormatter={(value) => scatterSeries.xTickLabels.get(Number(value)) ?? String(value)}
          allowDuplicatedCategory={false}
          label={{ value: xAxis, position: 'insideBottom', offset: -4, fill: '#233254' }}
        />
        <YAxis
          type="number"
          dataKey="y"
          tick={{ fill: '#273763', fontSize: 12 }}
          tickFormatter={(value) => scatterSeries.yTickLabels.get(Number(value)) ?? String(value)}
          allowDuplicatedCategory={false}
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#233254' }}
        />
        <Tooltip content={<ChartTooltip chartType={chartType} xAxis={xAxis} yAxis={yAxis} yAxisLabel={yAxisLabel} />} />
        <Scatter data={scatterSeries.points} fill="#1D4ED8" />
      </ScatterChart>
    );
  };

  return (
    <div className="h-full w-full rounded-2xl border border-slate-200/80 bg-white/70 p-3 md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}