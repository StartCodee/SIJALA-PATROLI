import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { formatReportDate } from "@/utils/monitoringFilterUtils";

function DetailTable({ title, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm">
      <div className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-center text-[11px] font-bold">
        {title}
      </div>
      <div className="divide-y divide-slate-300">
        {rows.map((row, index) =>
          row.fullWidth ? (
            <div key={`${title}-${index}`} className="px-3 py-2 text-[11px]">
              <div className="mb-2 font-medium text-slate-700">{row.label}</div>
              <div>{row.value}</div>
            </div>
          ) : (
            <div key={`${title}-${index}`} className="grid grid-cols-[10rem_1fr] text-[11px]">
              <div className="border-r border-slate-300 bg-white px-3 py-2 font-medium text-slate-700">
                {row.label}
              </div>
              <div className="px-3 py-2">{row.value}</div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ReportPhotoCarousel({ photos = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [photos]);

  const currentPhoto = photos[activeIndex] || null;

  if (!currentPhoto) {
    return <p className="text-[10px] text-slate-500">Belum ada foto temuan.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-slate-300">
        <img
          src={currentPhoto.src}
          alt={currentPhoto.caption?.ID || "Foto Temuan"}
          className="h-40 w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length)}
          className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
          disabled={photos.length <= 1}
        >
          <ChevronLeft size={12} />
        </button>
        <p className="flex-1 text-center text-[10px] text-slate-500">Pilih salah satu untuk ditampilkan</p>
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % photos.length)}
          className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
          disabled={photos.length <= 1}
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

export default function HabitatDashboardRightPanel({
  selectedRecord,
  activeReportDraft,
  relatedDetailPhotos,
  onDraftChange,
  onFocusLocation,
  onReject,
  onApprove,
  onDelete,
  showDeleteAction,
  onToggleDeleteAction,
}) {
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#163848]/75 p-3 xl:col-span-3">
      {selectedRecord ? (
        <div className="custom-scrollbar dashboard-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-[#1a4452]/80">
            <div className={selectedRecord.statusKey === "incoming" ? "grid grid-cols-[1fr_5.25rem_5.25rem]" : "block"}>
              <div className={`${selectedRecord.statusKey === "incoming" ? "border-r border-white/10" : ""} bg-[#215067] px-3 py-3`}>
                <p className="text-[11px] font-bold leading-tight text-white">
                  Area {selectedRecord.areaLabel} | Pos {selectedRecord.posLabel}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-cyan-100/90">
                  Koordinator: {selectedRecord.koordinatorLabel} | Speedboat: {selectedRecord.speedboatLabel}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-cyan-100/85">
                  {formatReportDate(selectedRecord.date || "", selectedRecord.reportTime || "08:00")}
                </p>
              </div>
              {selectedRecord.statusKey === "incoming" ? (
                <>
                  <button
                    type="button"
                    onClick={onReject}
                    className="border-r border-white/10 bg-[#8a4b1f] px-2 text-[11px] font-black uppercase tracking-wide text-orange-50 transition-colors hover:bg-[#a35724]"
                  >
                    Tolak
                  </button>
                  <button
                    type="button"
                    onClick={onApprove}
                    className="bg-[#2f7a44] px-2 text-[11px] font-black uppercase tracking-wide text-emerald-50 transition-colors hover:bg-[#389453]"
                  >
                    Setujui
                  </button>
                </>
              ) : null}
            </div>

            {selectedRecord.statusKey === "incoming" ? (
              <div className="border-t border-white/15 bg-[#103242] px-3 py-2">
                <button
                  type="button"
                  onClick={onToggleDeleteAction}
                  className="w-full border-t border-dashed border-white/20 pt-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-300/85"
                >
                  {showDeleteAction ? "Sembunyikan Aksi Delete" : "Tampilkan Aksi Delete"}
                </button>
                {showDeleteAction ? (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="w-full rounded-xl bg-[#dc2626] px-3 py-3 text-[11px] font-black uppercase tracking-wide text-white transition-colors hover:bg-[#ef4444]"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <DetailTable
            title="Table Daftar Hadir"
            rows={[
              {
                label: "Koordinator",
                value: <input value={activeReportDraft.attendanceKoordinator} onChange={(event) => onDraftChange("attendanceKoordinator", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Pencatat Posisi",
                value: <input value={activeReportDraft.attendancePencatatPosisi} onChange={(event) => onDraftChange("attendancePencatatPosisi", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Pencatat Pemanfaatan",
                value: <input value={activeReportDraft.attendancePencatatPemanfaatan} onChange={(event) => onDraftChange("attendancePencatatPemanfaatan", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
            ]}
          />

          <DetailTable
            title="Table Daftar Pengisian BBM"
            rows={[
              {
                label: "Jumlah Pengisian Awal (liter)",
                value: <input value={activeReportDraft.fuelLiters} onChange={(event) => onDraftChange("fuelLiters", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Keterangan / Catatan",
                value: <input value={activeReportDraft.fuelNotes} onChange={(event) => onDraftChange("fuelNotes", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Tempat Bermalam",
                value: <input value={activeReportDraft.restStop} onChange={(event) => onDraftChange("restStop", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Deskripsi Wilayah Tujuan patroli",
                value: <textarea value={activeReportDraft.routeDescription} onChange={(event) => onDraftChange("routeDescription", event.target.value)} className="min-h-[5rem] w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Sketsa Rute Patroli",
                fullWidth: true,
                value: (
                  <div className="flex h-28 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                    <div className="relative h-20 w-full max-w-[14rem]">
                      <span className="absolute left-4 top-14 h-[2px] w-[75%] -rotate-[24deg] bg-slate-500" />
                      <span className="absolute left-6 top-4 h-3 w-3 rounded-full border border-slate-600 bg-white" />
                      <span className="absolute right-6 bottom-4 h-3 w-3 rounded-full border border-slate-600 bg-white" />
                    </div>
                  </div>
                ),
              },
            ]}
          />

          <DetailTable
            title="Identifikasi Temuan"
            rows={[
              {
                label: "Temuan Manta",
                value: (
                  <select value={activeReportDraft.hasFinding} onChange={(event) => onDraftChange("hasFinding", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1">
                    <option value="Ada">Ada</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                ),
              },
              {
                label: "Pelanggaran",
                value: (
                  <select value={activeReportDraft.violationStatus} onChange={(event) => onDraftChange("violationStatus", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1">
                    <option value="Ada">Ada</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                ),
              },
              {
                label: "Lokasi Temuan",
                value: (
                  <div className="flex items-center justify-between gap-2">
                    <input value={activeReportDraft.coordinateText} onChange={(event) => onDraftChange("coordinateText", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />
                    <button
                      type="button"
                      onClick={onFocusLocation}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100"
                      aria-label="Fokus ke marker temuan"
                      title="Fokus ke marker temuan"
                    >
                      <Map size={14} />
                    </button>
                  </div>
                ),
              },
              {
                label: "Nomor GPS",
                value: <input value={activeReportDraft.gpsId} onChange={(event) => onDraftChange("gpsId", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Nama Lokasi Temuan",
                value: <input value={activeReportDraft.findingLocationName} onChange={(event) => onDraftChange("findingLocationName", event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1" />,
              },
              {
                label: "Foto Temuan",
                fullWidth: true,
                value: <ReportPhotoCarousel photos={relatedDetailPhotos} />,
              },
            ]}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </aside>
  );
}
