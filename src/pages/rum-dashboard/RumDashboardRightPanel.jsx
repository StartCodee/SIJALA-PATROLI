import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { formatReportDate } from "@/utils/monitoringFilterUtils";
import { RUM_CATEGORY_TABS } from "@/data/rumData";

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
            <div key={`${title}-${index}`} className="grid grid-cols-[9.5rem_1fr] text-[11px]">
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
    return (
      <div className="rounded-xl border border-slate-300 bg-white px-3 py-4 text-[11px] text-slate-500">
        Belum ada dokumentasi foto.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-300 bg-white p-3">
      <div className="overflow-hidden rounded-md border border-slate-300">
        <img
          src={currentPhoto.src}
          alt={currentPhoto.caption?.ID || "Dokumentasi RUM"}
          className="h-44 w-full object-cover"
        />
      </div>
      <p className="text-[11px] font-semibold text-slate-800">
        {currentPhoto.caption?.ID || "Dokumentasi RUM"}
      </p>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length)}
          className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
          disabled={photos.length <= 1}
        >
          <ChevronLeft size={12} />
        </button>
        <p className="text-[10px] text-slate-500">Pilih salah satu untuk ditampilkan</p>
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

function buildAttendanceRows(draft, onDraftChange) {
  if (!draft) return [];

  return [
    {
      label: "Koordinator",
      value: (
        <input
          value={draft.attendanceKoordinator}
          onChange={(event) => onDraftChange("attendanceKoordinator", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Pencatat Posisi",
      value: (
        <input
          value={draft.attendancePencatatPosisi}
          onChange={(event) => onDraftChange("attendancePencatatPosisi", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Pencatat Pemanfaatan",
      value: (
        <input
          value={draft.attendancePencatatPemanfaatan}
          onChange={(event) => onDraftChange("attendancePencatatPemanfaatan", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
  ];
}

function buildFuelRows(draft, onDraftChange) {
  if (!draft) return [];

  return [
    {
      label: "Jumlah Pengisian Awal (liter)",
      value: (
        <input
          value={draft.fuelLiters}
          onChange={(event) => onDraftChange("fuelLiters", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Keterangan / Catatan",
      value: (
        <input
          value={draft.fuelNotes}
          onChange={(event) => onDraftChange("fuelNotes", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Tempat Bermalam",
      value: (
        <input
          value={draft.restStop}
          onChange={(event) => onDraftChange("restStop", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Deskripsi Wilayah Tujuan patroli",
      value: (
        <textarea
          value={draft.routeDescription}
          onChange={(event) => onDraftChange("routeDescription", event.target.value)}
          className="min-h-[5rem] w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
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
  ];
}

function buildCategoryRows(tabKey, draft, onDraftChange, onFocusLocation, photos) {
  if (!draft) return [];

  const commonRows = [
    {
      label: "Lokasi Temuan",
      value: (
        <div className="flex items-center justify-between gap-2">
          <input
            value={draft.coordinateText}
            onChange={(event) => onDraftChange("coordinateText", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
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
      value: (
        <input
          value={draft.gpsId}
          onChange={(event) => onDraftChange("gpsId", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Nama Lokasi Temuan",
      value: (
        <input
          value={draft.locationLabel}
          onChange={(event) => onDraftChange("locationLabel", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
  ];

  if (tabKey === "tetap") {
    return [
      {
        label: "Sumber Daya Tetap",
        value: (
          <select
            value={draft.temuanTetapStatus}
            onChange={(event) => onDraftChange("temuanTetapStatus", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          >
            <option value="Ada">Ada</option>
            <option value="Tidak">Tidak</option>
          </select>
        ),
      },
      ...commonRows,
      {
        label: "Jenis",
        value: (
          <input
            value={draft.jenisTetap}
            onChange={(event) => onDraftChange("jenisTetap", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Kapasitas",
        value: (
          <input
            value={draft.kapasitas}
            onChange={(event) => onDraftChange("kapasitas", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Kondisi",
        value: (
          <input
            value={draft.kondisiTetap}
            onChange={(event) => onDraftChange("kondisiTetap", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Lokasi Aset",
        value: (
          <input
            value={draft.lokasiTetap}
            onChange={(event) => onDraftChange("lokasiTetap", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Foto Temuan",
        fullWidth: true,
        value: <ReportPhotoCarousel photos={photos} />,
      },
    ];
  }

  if (tabKey === "megafauna") {
    return [
      {
        label: "Megafauna",
        value: (
          <select
            value={draft.temuanMegafaunaStatus}
            onChange={(event) => onDraftChange("temuanMegafaunaStatus", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          >
            <option value="Ada">Ada</option>
            <option value="Tidak">Tidak</option>
          </select>
        ),
      },
      ...commonRows,
      {
        label: "Spesies",
        value: (
          <input
            value={draft.spesies}
            onChange={(event) => onDraftChange("spesies", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Jumlah",
        value: (
          <input
            value={draft.jumlahMegafauna}
            onChange={(event) => onDraftChange("jumlahMegafauna", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Kondisi",
        value: (
          <input
            value={draft.kondisiMegafauna}
            onChange={(event) => onDraftChange("kondisiMegafauna", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Lokasi Megafauna",
        value: (
          <input
            value={draft.lokasiMegafauna}
            onChange={(event) => onDraftChange("lokasiMegafauna", event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        ),
      },
      {
        label: "Foto Temuan",
        fullWidth: true,
        value: <ReportPhotoCarousel photos={photos} />,
      },
    ];
  }

  return [
    {
      label: "Sumber Daya Tidak Tetap",
      value: (
        <select
          value={draft.temuanTidakTetapStatus}
          onChange={(event) => onDraftChange("temuanTidakTetapStatus", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        >
          <option value="Ada">Ada</option>
          <option value="Tidak">Tidak</option>
        </select>
      ),
    },
    ...commonRows,
    {
      label: "Hasil Tangkapan",
      value: (
        <input
          value={draft.hasilTangkapan}
          onChange={(event) => onDraftChange("hasilTangkapan", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Panjang",
      value: (
        <input
          value={draft.panjang}
          onChange={(event) => onDraftChange("panjang", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Jumlah",
      value: (
        <input
          value={draft.jumlah}
          onChange={(event) => onDraftChange("jumlah", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Berat Basah",
      value: (
        <input
          value={draft.beratBasah}
          onChange={(event) => onDraftChange("beratBasah", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Berat Kering",
      value: (
        <input
          value={draft.beratKering}
          onChange={(event) => onDraftChange("beratKering", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Keterangan",
      value: (
        <input
          value={draft.keterangan}
          onChange={(event) => onDraftChange("keterangan", event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      ),
    },
    {
      label: "Foto Temuan",
      fullWidth: true,
      value: <ReportPhotoCarousel photos={photos} />,
    },
  ];
}

export default function RumDashboardRightPanel({
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
  const [activeTab, setActiveTab] = useState("tidak-tetap");

  useEffect(() => {
    if (selectedRecord?.categoryKey) {
      setActiveTab(selectedRecord.categoryKey);
    }
  }, [selectedRecord?.categoryKey]);

  const visibleDetailPhotos = useMemo(
    () =>
      relatedDetailPhotos.filter(
        (item) => item.categoryKey === activeTab || item.category === activeTab
      ),
    [activeTab, relatedDetailPhotos]
  );

  const categoryRows = useMemo(
    () =>
      buildCategoryRows(
        activeTab,
        activeReportDraft,
        onDraftChange,
        onFocusLocation,
        visibleDetailPhotos
      ),
    [activeReportDraft, activeTab, onDraftChange, onFocusLocation, visibleDetailPhotos]
  );

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
                  Koordinator: {activeReportDraft.koordinatorLabel} | Speedboat: {activeReportDraft.speedboatLabel}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-cyan-100/85">
                  {formatReportDate(selectedRecord.dateValue || "", selectedRecord.reportTime || "08:00")}
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

          <div className="overflow-hidden rounded-xl border border-white/15 bg-[#103242]">
            <div className="grid grid-cols-3">
              {RUM_CATEGORY_TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-2 py-3 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      active
                        ? "bg-cyan-300/18 text-cyan-100"
                        : "border-r border-white/10 text-slate-200/75 last:border-r-0 hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeReportDraft ? (
            <>
              <DetailTable
                title="Table Daftar Hadir"
                rows={buildAttendanceRows(activeReportDraft, onDraftChange)}
              />
              <DetailTable
                title="Table Pengisian BBM"
                rows={buildFuelRows(activeReportDraft, onDraftChange)}
              />
              <DetailTable
                title="Table Identifikasi Temuan"
                rows={categoryRows}
              />
            </>
          ) : (
            <div className="rounded-xl border border-slate-300 bg-white px-3 py-4 text-[11px] text-slate-500">
              Menyiapkan detail laporan...
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </aside>
  );
}
