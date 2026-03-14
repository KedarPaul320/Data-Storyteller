import { useEffect, useState } from "react";
import { useFileContext } from "../../context/FileContext";
import { 
  Sidebar, SidebarContent, SidebarHeader, SidebarGroup, 
  SidebarGroupLabel, SidebarGroupContent 
} from "../ui/sidebar";
import { Checkbox } from "../ui/checkbox";

interface AppSidebarProps {
  onFiltersChange: (filters: any) => void;
}

export function AppSidebar({ onFiltersChange }: AppSidebarProps) {
  const { fileSession } = useFileContext();
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

  const formatNumericLabel = (value: number) => {
    if (!Number.isFinite(value)) return '-';
    if (Math.abs(value) >= 1000000) {
      return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    }
    if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (Math.abs(value) >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFiltersChange(localFilters);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  if (!fileSession) return <Sidebar><SidebarContent /></Sidebar>;
  const { metadata } = fileSession;

  const handleCheck = (col: string, val: string, checked: boolean) => {
    setLocalFilters((prev) => {
      const current = prev[col] || [];
      return {
       ...prev,
        [col]: checked? [...current, val] : current.filter((v: string) => v!== val)
      };
    });
  };

  const handleSlider = (col: string, val: number) => {
    setLocalFilters((prev) => ({
     ...prev,
      [col]: { min: metadata.numerical[col].min, max: val }
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Data Storyteller logo" className="h-8 w-8 rounded-md bg-white p-1" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold tracking-tight text-sidebar-foreground">Data Filters</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/70">Auto-updates active charts</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="space-y-4 p-3 pr-2">
        {/* Dynamically render Numerical Filters (Number Data) first */}
        {Object.entries(metadata.numerical).map(([col, range]) => (
          <SidebarGroup key={col} className="rounded-lg border border-sidebar-border/55 bg-white/70 p-2">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/75">{col}</SidebarGroupLabel>
            <SidebarGroupContent className="mt-3">
              {(() => {
                const currentMax = localFilters[col]?.max ?? range.max;
                const sliderStep = Math.max((range.max - range.min) / 200, 0.000001);
                return (
                  <>
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-sidebar-foreground/70">
                      <span>{formatNumericLabel(range.min)}</span>
                      <span>{formatNumericLabel(currentMax)}</span>
                    </div>
                    <input
                      type="range"
                      min={range.min}
                      max={range.max}
                      step={sliderStep}
                      value={currentMax}
                      onChange={(event) => handleSlider(col, Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-300 accent-blue-700"
                    />
                  </>
                );
              })()}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Dynamically render Categorical Filters (Text Data) */}
        {Object.entries(metadata.categorical).map(([col, values]) => (
          <SidebarGroup key={col} className="rounded-lg border border-sidebar-border/55 bg-white/70 p-2">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/75">{col}</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-3 mt-3">
              {/* Limiting to 10 to prevent massive lists in the UI */}
              {values.slice(0, 10).map((val: string) => ( 
                <div key={val} className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-sidebar-accent/60 transition-colors">
                  <Checkbox
                    id={`${col}-${val}`}
                    onCheckedChange={(checked) => handleCheck(col, val, checked as boolean)}
                  />
                  <label htmlFor={`${col}-${val}`} className="cursor-pointer truncate text-sm text-sidebar-foreground/90" title={val}>{val}</label>
                </div>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}