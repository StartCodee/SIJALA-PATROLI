import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

function EmbedCodePanel({ dashboardPath }) {
  const [copied, setCopied] = useState(false);
  const src =
    typeof window !== "undefined" ? `${window.location.origin}${dashboardPath}` : dashboardPath;
  const code = `<iframe\n  src="${src}"\n  width="100%"\n  height="800"\n  style="border:none;"\n></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-300">Embed Code</p>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/35 p-2 text-[10px] leading-relaxed text-cyan-100">
        {code}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[10px] text-white"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy Embed Code"}
      </button>
    </div>
  );
}

function LeftInfoCell({ title, value = "" }) {
  return (
    <div className="flex min-h-[4.7rem] flex-col items-center justify-center border-r border-white/12 bg-[#1a4452]/55 px-3 py-2 text-center last:border-r-0">
      <p className="text-[10px] font-bold uppercase leading-tight text-slate-300/80">{title}</p>
      {value ? <p className="mt-2 text-[11px] font-semibold leading-tight text-white">{value}</p> : null}
    </div>
  );
}

function LeftSelectCell({ title, value, options, onChange }) {
  const selectedLabel = options.find((option) => option.value === value)?.label?.ID || "-";
  const displayLabel = value !== "all" ? selectedLabel : title;

  return (
    <div className="border-r border-white/12 bg-[#1a4452]/55 last:border-r-0">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={title}
          className="h-full min-h-[4.7rem] w-full rounded-none border-0 bg-transparent px-3 py-2 text-white shadow-none ring-0 transition-colors hover:bg-[#205066]/65 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
        >
          <div className="flex w-full min-h-[3.4rem] flex-col items-center justify-center gap-1 text-center">
            <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">
              {displayLabel}
            </span>
            <span className="shrink-0 text-cyan-100/85 opacity-90">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#103242] text-white">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer text-white focus:bg-cyan-300/15 focus:text-white"
            >
              {option.label.ID}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LeftBigMetric({ title, value, valueClassName }) {
  return (
    <div className="min-h-[5.75rem] border-r border-white/12 bg-[#163848]/70 px-3 py-2 text-center last:border-r-0">
      <p className="min-h-8 text-[10px] font-bold leading-tight text-white">{title}</p>
      <p className={`mt-2 text-6xl font-black leading-none ${valueClassName}`}>{value}</p>
    </div>
  );
}

function LeftMiniMetric({ title, value }) {
  return (
    <div className="min-h-[5.5rem] border-r border-t border-b border-white/12 bg-[#183848]/65 px-3 py-2 last:border-r-0">
      <p className="min-h-8 text-[9px] font-bold uppercase leading-tight text-slate-300/80">
        {title}
      </p>
      <p className="mt-3 text-sm font-black leading-tight text-white">{value}</p>
    </div>
  );
}

function HabitatStatusBadge({ label, active }) {
  return (
    <div
      className={`flex w-full flex-col rounded-[7px] px-2 py-1.5 text-center ${
        active ? "bg-[#1ea51e]" : "bg-[#d11f1f]"
      }`}
    >
      <p className="text-[8px] font-bold uppercase leading-tight text-white">{label}</p>
      <p className="mt-1 rounded-[5px] bg-black/75 px-1.5 py-1 text-[9px] font-black leading-none text-white">
        {active ? "Ada" : "Tidak"}
      </p>
    </div>
  );
}

function ReportFeedCard({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`w-full rounded-xl border p-2 text-left transition-colors ${
        active
          ? "border-cyan-300/50 bg-cyan-300/12"
          : "border-white/12 bg-[#1a4452]/75 hover:border-cyan-300/35 hover:bg-[#215067]/75"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold leading-tight text-cyan-100">
          Area {item.areaLabel} | Pos {item.posLabel}
        </p>
        <p className="mt-1 text-[10px] leading-tight text-slate-200/85">
          Koordinator: {item.koordinatorLabel} | Speedboat: {item.speedboatLabel}
        </p>
        <p className="mt-1 text-[10px] font-medium leading-tight text-slate-400">
          {item.dateText}
        </p>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        <HabitatStatusBadge label="Temuan Manta" active={item.hasMantaFinding} />
        <HabitatStatusBadge label="Pelanggaran" active={item.hasViolation} />
      </div>
    </button>
  );
}

export default function HabitatDashboardLeftPanel({
  selectedKkp,
  kkpOptions,
  onKkpChange,
  selectedPosLabel,
  locationMonitoringLabel,
  totalReports,
  pendingReports,
  approvedReports,
  averageApprovalLatency,
  conservationAreaLabel,
  totalViolationsLabel,
  selectedRecordId,
  onReset,
  reportListFilter,
  onReportListFilterChange,
  reportStatusFilters,
  selectedReportStatusLabel,
  visibleLeftPanelFeed,
  onSelectRecord,
  showEmbedGenerator,
}) {
  return (
    <aside className="flex min-h-0 flex-col space-y-0 overflow-hidden rounded-xl border border-white/15 bg-[#163848]/75 p-0 text-white xl:col-span-3">
      <div className="flex items-center justify-between border-b border-white/12 bg-[#1a4452]/75 px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#2754ff] text-[11px] font-black text-white">
            F
          </div>
          <div className="text-[11px] font-bold leading-tight text-white">
            <p>Selamat datang Ailan</p>
            <p className="text-cyan-300">Administrator Utama</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-white">Terbaru</span>
      </div>

      <div className="grid grid-cols-3 border-b border-white/12 text-center">
        <LeftSelectCell
          title="Area Kawasan Konservasi"
          value={selectedKkp}
          options={kkpOptions}
          onChange={onKkpChange}
        />
        <LeftInfoCell title="Pos Pengawasan" value={selectedPosLabel} />
        <LeftInfoCell title="Lokasi Monitoring" value={locationMonitoringLabel} />
      </div>

      <div className="grid grid-cols-3">
        <LeftBigMetric
          title="Total Laporan Masuk"
          value={totalReports}
          valueClassName="text-[#ff3b20]"
        />
        <LeftBigMetric
          title="Total Laporan Tertunda"
          value={pendingReports}
          valueClassName="text-[#ff9b24]"
        />
        <LeftBigMetric
          title="Total Laporan yang telah disetujui"
          value={approvedReports}
          valueClassName="text-[#37d437]"
        />
      </div>

      <div className="grid grid-cols-3">
        <LeftMiniMetric title="Rata-rata Latensi Waktu" value={averageApprovalLatency} />
        <LeftMiniMetric title="Luas Area Konservasi (Ha)" value={conservationAreaLabel} />
        <LeftMiniMetric title="Total Wisatawan" value={totalViolationsLabel} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-wide text-white">Laporan Masuk</p>
          {selectedRecordId ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-100 transition-colors hover:bg-white/14"
            >
              Reset
            </button>
          ) : null}
        </div>

        <div className="mt-2">
          <Select value={reportListFilter} onValueChange={onReportListFilterChange}>
            <SelectTrigger className="h-auto min-h-[3.35rem] w-full rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-left text-white shadow-none ring-0 hover:border-cyan-300/25 hover:bg-white/10 focus:ring-0 focus:ring-offset-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase leading-tight text-slate-300/85">
                  Jenis Laporan
                </p>
                <p className="mt-1 text-[12px] font-semibold leading-tight text-white">
                  {selectedReportStatusLabel}
                </p>
              </div>
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#103242] text-white">
              {reportStatusFilters.map((filterItem) => (
                <SelectItem
                  key={filterItem.key}
                  value={filterItem.key}
                  className="cursor-pointer text-white focus:bg-cyan-300/15 focus:text-white"
                >
                  {filterItem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="custom-scrollbar dashboard-scrollbar mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {visibleLeftPanelFeed.length === 0 ? (
            <div className="rounded-xl border border-white/12 bg-[#1a4452]/75 px-3 py-4 text-[11px] text-slate-300/75">
              Belum ada laporan yang cocok dengan filter aktif.
            </div>
          ) : (
            visibleLeftPanelFeed.map((item) => (
              <ReportFeedCard
                key={item.id}
                item={item}
                active={selectedRecordId === item.id}
                onClick={onSelectRecord}
              />
            ))
          )}
        </div>
      </div>

      {showEmbedGenerator ? (
        <div className="px-4 pb-4">
          <EmbedCodePanel dashboardPath="/monitoring-habitat" />
        </div>
      ) : null}
    </aside>
  );
}
