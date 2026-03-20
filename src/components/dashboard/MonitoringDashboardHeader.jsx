import { CalendarRange, ChevronDown, Download, FileSpreadsheet, FileText, RotateCcw, X } from "lucide-react";
import { DEFAULT_FILTER_RANGE, formatFilterDateLabel, resolveQuickRangeDates } from "@/utils/monitoringFilterUtils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getRangeSummary({ dateFrom, dateTo, defaultFrom, defaultTo }) {
  if (dateFrom === defaultFrom && dateTo === defaultTo) {
    return "Semua waktu";
  }

  const fromLabel = formatFilterDateLabel(dateFrom);
  const toLabel = formatFilterDateLabel(dateTo);
  return fromLabel && toLabel ? `${fromLabel} - ${toLabel}` : "Rentang Waktu";
}

function DateRangePicker({ dateFrom, dateTo, onDateRangeChange, defaultFrom, defaultTo }) {
  const today = resolveQuickRangeDates("harian");

  return (
    <div className="w-[20rem] max-w-[calc(100vw-1rem)] rounded-xl border border-cyan-300/25 bg-[#12384a]/95 p-3 text-white shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-sm">
      <p className="mb-3 text-sm font-bold text-white">Filter Rentang Waktu</p>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-200/80">Dari</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateRangeChange(event.target.value, dateTo)}
            className="h-10 w-full rounded-lg border border-white/15 bg-[#0f2d3a] px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/60"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-200/80">Sampai</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => onDateRangeChange(dateFrom, event.target.value)}
            className="h-10 w-full rounded-lg border border-white/15 bg-[#0f2d3a] px-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/60"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onDateRangeChange(defaultFrom, defaultTo)}
          className="border-cyan-300/35 bg-white/5 text-cyan-100 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={14} />
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onDateRangeChange(today.from, today.to)}
          className="border-cyan-300/35 bg-white/5 text-cyan-100 hover:bg-white/10 hover:text-white"
        >
          Hari Ini
        </Button>
      </div>
    </div>
  );
}

export default function MonitoringDashboardHeader({
  title,
  subtitle,
  dateFrom,
  dateTo,
  onDateRangeChange,
  onExit,
  onExportExcel,
  onExportPdf,
  hasExportData = true,
  defaultFrom = DEFAULT_FILTER_RANGE.from,
  defaultTo = DEFAULT_FILTER_RANGE.to,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-[#0c466a]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[112.5rem] flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black text-white md:text-xl">{title}</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100/80">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex min-w-[15rem] items-center justify-between gap-2 rounded-lg border border-cyan-300/25 bg-[#0f3b56] px-3 py-2 text-left text-xs font-semibold text-white transition-colors hover:bg-[#124762]"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarRange size={15} />
                  Rentang Waktu
                </span>
                <span className="truncate text-cyan-100/80">{getRangeSummary({ dateFrom, dateTo, defaultFrom, defaultTo })}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto border-0 bg-transparent p-0 shadow-none">
              <DateRangePicker
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateRangeChange={onDateRangeChange}
                defaultFrom={defaultFrom}
                defaultTo={defaultTo}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-50 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!hasExportData}
              >
                <Download size={15} />
                Export
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48 border-white/10 bg-[#12384a] text-white">
              <DropdownMenuItem
                onClick={onExportExcel}
                className="cursor-pointer text-slate-100 focus:bg-white/10 focus:text-white"
              >
                <FileSpreadsheet size={15} />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onExportPdf}
                className="cursor-pointer text-slate-100 focus:bg-white/10 focus:text-white"
              >
                <FileText size={15} />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300/35 bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
          >
            <X size={14} />
            Exit
          </button>
        </div>
      </div>
    </header>
  );
}
