import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MonitoringDashboardHeader from "@/components/dashboard/MonitoringDashboardHeader";
import DashboardMap from "@/components/map/DashboardMap";
import fullGeoJson from "@/data/geojson/fullGeo.json";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_FILTER_RANGE,
  formatIndonesiaNumber,
  formatLatencyDuration,
  formatReportDate,
  getDateValue,
  isDateInRange,
} from "@/utils/monitoringFilterUtils";
import {
  buildExportFileName,
  exportRowsToExcel,
  exportRowsToPdf,
} from "@/utils/dashboardExportUtils";
import {
  buildInitialHabitatReportDraft,
  EMBED_MAP_CONTAINER_CLASS,
  habitatEmbedReports,
  dokumentasiItems,
  KKP_OPTIONS,
  mapCenter as habitatMapCenter,
  mapZoom as habitatMapZoom,
  resolveHabitatApprovalDelaySeconds,
} from "@/data/habitatData";
import HabitatDashboardLeftPanel from "./HabitatDashboardLeftPanel";
import HabitatDashboardRightPanel from "./HabitatDashboardRightPanel";

function HabitatDashboardBody({
  geoJsonData,
  showEmbedGenerator = false,
  dateFrom = DEFAULT_FILTER_RANGE.from,
  dateTo = DEFAULT_FILTER_RANGE.to,
  onExportRowsChange,
}) {
  const [selectedKkp, setSelectedKkp] = useState("all");
  const [reportListFilter, setReportListFilter] = useState("all");
  const [focusRequestKey, setFocusRequestKey] = useState(0);
  const [forcedFocusPoint, setForcedFocusPoint] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [reportStatusOverrides, setReportStatusOverrides] = useState({});
  const [reportDrafts, setReportDrafts] = useState({});
  const [deletedRecordIds, setDeletedRecordIds] = useState([]);
  const [showDeleteAction, setShowDeleteAction] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState("");

  const habitatDocumentationItems = useMemo(
    () =>
      habitatEmbedReports.map((report, index) => {
        const template = dokumentasiItems[index % dokumentasiItems.length] || {};
        return {
          ...template,
          id: `DOK-${report.id}`,
          reportId: report.id,
          zone: report.zone,
          pos: report.pos,
          dateValue: getDateValue(report.date),
          caption: {
            ID: `Dokumentasi ${report.locationLabel}`,
            EN: template.caption?.EN || report.locationLabel,
          },
          date: formatReportDate(report.date, report.reportTime),
        };
      }),
    []
  );

  const filteredReports = useMemo(
    () =>
      habitatEmbedReports.filter((point) => {
        if (deletedRecordIds.includes(point.id)) return false;
        if (selectedKkp !== "all" && point.zone !== selectedKkp) return false;
        if (!isDateInRange(getDateValue(point.date), dateFrom, dateTo)) return false;
        return true;
      }).map((point) => ({
        ...point,
        statusKey: reportStatusOverrides[point.id] || point.statusKey,
      })),
    [dateFrom, dateTo, deletedRecordIds, reportStatusOverrides, selectedKkp]
  );

  const selectedRecord = useMemo(
    () =>
      filteredReports.find((item) => item.id === selectedRecordId) ||
      habitatEmbedReports.find((item) => item.id === selectedRecordId) ||
      null,
    [filteredReports, selectedRecordId]
  );

  useEffect(() => {
    if (selectedRecordId && !filteredReports.some((item) => item.id === selectedRecordId)) {
      setSelectedRecordId("");
    }
  }, [filteredReports, selectedRecordId]);

  useEffect(() => {
    if (selectedRecord && reportListFilter !== "all" && selectedRecord.statusKey !== reportListFilter) {
      setSelectedRecordId("");
    }
  }, [reportListFilter, selectedRecord]);

  useEffect(() => {
    if (!selectedRecord) return;
    setReportDrafts((prev) => {
      if (prev[selectedRecord.id]) return prev;
      return {
        ...prev,
        [selectedRecord.id]: buildInitialHabitatReportDraft(selectedRecord),
      };
    });
  }, [selectedRecord]);

  const currentCenter = useMemo(() => {
    if (forcedFocusPoint) return [forcedFocusPoint.lat, forcedFocusPoint.lng];
    if (selectedRecord) return [selectedRecord.lat, selectedRecord.lng];
    return habitatMapCenter;
  }, [forcedFocusPoint, selectedRecord]);

  const currentZoom = selectedRecord || forcedFocusPoint ? 12 : habitatMapZoom;

  const leftPanelFeed = useMemo(
    () =>
      [...filteredReports]
        .sort((a, b) => {
          const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));
          if (dateCompare !== 0) return dateCompare;
          return String(b.reportTime || "00:00").localeCompare(String(a.reportTime || "00:00"));
        })
        .map((item) => ({
          ...item,
          coordinateText: `${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`,
          dateText: formatReportDate(item.date, item.reportTime),
        })),
    [filteredReports]
  );

  const relatedDetailPhotos = useMemo(() => {
    if (!selectedRecord) return [];
    return habitatDocumentationItems
      .filter(
        (item) =>
          item.reportId === selectedRecord.id ||
          (item.zone === selectedRecord.zone && item.pos === selectedRecord.pos)
      )
      .slice(0, 6);
  }, [habitatDocumentationItems, selectedRecord]);

  const activeReportDraft = useMemo(() => {
    if (!selectedRecord) return null;
    return {
      ...buildInitialHabitatReportDraft(selectedRecord),
      ...(reportDrafts[selectedRecord.id] || {}),
    };
  }, [reportDrafts, selectedRecord]);

  const totalReports = filteredReports.filter((item) => item.statusKey === "incoming").length;
  const pendingReports = filteredReports.filter((item) => item.statusKey === "pending").length;
  const approvedReports = filteredReports.filter((item) => item.statusKey === "approved").length;
  const reportStatusFilters = [
    { key: "all", label: "Semua Laporan" },
    { key: "incoming", label: "Laporan Masuk" },
    { key: "pending", label: "Laporan Tertunda" },
    { key: "approved", label: "Laporan Selesai" },
  ];
  const visibleLeftPanelFeed = useMemo(() => {
    if (reportListFilter === "all") return leftPanelFeed;
    return leftPanelFeed.filter((item) => item.statusKey === reportListFilter);
  }, [leftPanelFeed, reportListFilter]);
  const visibleReportMedia = useMemo(() => {
    if (reportListFilter === "all") return filteredReports;
    return filteredReports.filter((item) => item.statusKey === reportListFilter);
  }, [filteredReports, reportListFilter]);
  const selectedReportStatusLabel =
    reportStatusFilters.find((item) => item.key === reportListFilter)?.label ||
    reportStatusFilters[0].label;
  const averageApprovalLatency = useMemo(() => {
    const approvedFeed = filteredReports.filter((item) => item.statusKey === "approved");
    if (approvedFeed.length === 0) return "-";

    const totalLatencySeconds = approvedFeed.reduce(
      (sum, item) => sum + resolveHabitatApprovalDelaySeconds(item.id),
      0
    );
    return formatLatencyDuration(Math.round(totalLatencySeconds / approvedFeed.length));
  }, [filteredReports, pendingReports]);
  const selectedPosLabel = selectedRecord?.posLabel || "Semua Pos Jaga";
  const locationMonitoringLabel = selectedRecord?.locationLabel || "Semua Lokasi";
  const conservationAreaHa = (new Set(filteredReports.map((point) => point.zone)).size || 1) * 1428571.43;
  const totalViolations = filteredReports.filter((item) => item.hasViolation).length;
  const mapPoints = useMemo(
    () =>
      visibleReportMedia.map((item) => ({
        ...item,
        markerType: "report",
        label: item.locationLabel || item.label || item.id,
        date: item.date,
        finding: item,
      })),
    [visibleReportMedia]
  );

  const findingPoints = useMemo(
    () =>
      visibleReportMedia
        .filter((item) => item.hasMantaFinding || item.hasViolation)
        .map((item) => ({
          id: `temuan-${item.id}`,
          lat: item.lat,
          lng: item.lng,
          label: item.locationLabel || item.label || item.id,
          zone: item.zone,
          pos: item.pos,
          date: item.date,
          markerType: "temuan",
          finding: item,
        })),
    [visibleReportMedia]
  );

  const patrolTeamPoints = useMemo(
    () =>
      filteredReports.map((item) => ({
        id: `tim-${item.id}`,
        lat: item.lat,
        lng: item.lng,
        label: `${item.areaLabel} | ${item.posLabel}`,
        zone: item.zone,
        pos: item.pos,
        date: item.date,
      })),
    [filteredReports]
  );

  const handleSelectRecord = (record) => {
    setSelectedRecordId(record.id);
    setShowDeleteAction(false);
    setForcedFocusPoint({ lat: record.lat, lng: record.lng });
    setFocusRequestKey((prev) => prev + 1);
  };

  const handleClearSelectedRecord = () => {
    setSelectedRecordId("");
    setShowDeleteAction(false);
    setForcedFocusPoint(null);
  };

  const handleDraftChange = (field, value) => {
    if (!selectedRecord) return;
    setReportDrafts((prev) => ({
      ...prev,
      [selectedRecord.id]: {
        ...(prev[selectedRecord.id] || buildInitialHabitatReportDraft(selectedRecord)),
        [field]: value,
      },
    }));
  };

  const handleFocusLocation = () => {
    if (!selectedRecord) return;
    setForcedFocusPoint({ lat: selectedRecord.lat, lng: selectedRecord.lng });
    setFocusRequestKey((prev) => prev + 1);
  };

  const handleApproveSelectedRecord = () => {
    if (!selectedRecord) return;
    setReportStatusOverrides((prev) => ({ ...prev, [selectedRecord.id]: "approved" }));
    setShowDeleteAction(false);
    setSelectedRecordId("");
  };

  const handleRejectSelectedRecord = () => {
    if (!selectedRecord) return;
    setShowRejectDialog(true);
  };

  const handleSubmitRejectReason = () => {
    if (!selectedRecord) return;
    if (!rejectReasonDraft.trim()) return;
    setReportStatusOverrides((prev) => ({ ...prev, [selectedRecord.id]: "pending" }));
    setShowRejectDialog(false);
    setRejectReasonDraft("");
    setShowDeleteAction(false);
    setSelectedRecordId("");
  };

  const handleDeleteSelectedRecord = () => {
    if (!selectedRecord) return;
    setDeletedRecordIds((prev) => [...prev, selectedRecord.id]);
    setShowDeleteAction(false);
    setSelectedRecordId("");
  };
  const exportRows = useMemo(
    () =>
      filteredReports.map((item) => ({
        tanggal: formatReportDate(item.date, item.reportTime),
        kawasan: item.areaLabel || item.zone || "-",
        posJaga: item.posLabel || item.pos || "-",
        lokasi: item.locationLabel || item.label || "-",
        koordinator: item.koordinatorLabel || "-",
        speedboat: item.speedboatLabel || "-",
        temuanManta: item.hasMantaFinding ? "Ada" : "Tidak",
        pelanggaran: item.hasViolation ? "Ada" : "Tidak",
        jenisPelanggaran: item.violationType || "-",
      })),
    [filteredReports]
  );

  useEffect(() => {
    onExportRowsChange?.(exportRows);
  }, [exportRows, onExportRowsChange]);

  return (
    <div className="mx-auto h-full max-w-[115.625rem] px-2 pb-2 md:px-3">
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-12">
        <HabitatDashboardLeftPanel
          selectedKkp={selectedKkp}
          kkpOptions={KKP_OPTIONS}
          onKkpChange={setSelectedKkp}
          selectedPosLabel={selectedPosLabel}
          locationMonitoringLabel={locationMonitoringLabel}
          totalReports={totalReports}
          pendingReports={pendingReports}
          approvedReports={approvedReports}
          averageApprovalLatency={averageApprovalLatency}
          conservationAreaLabel={formatIndonesiaNumber(conservationAreaHa)}
          totalViolationsLabel={totalViolations.toLocaleString("id-ID")}
          selectedRecordId={selectedRecordId}
          onReset={handleClearSelectedRecord}
          reportListFilter={reportListFilter}
          onReportListFilterChange={setReportListFilter}
          reportStatusFilters={reportStatusFilters}
          selectedReportStatusLabel={selectedReportStatusLabel}
          visibleLeftPanelFeed={visibleLeftPanelFeed}
          onSelectRecord={handleSelectRecord}
          showEmbedGenerator={showEmbedGenerator}
        />

        <main className="flex min-h-0 flex-col rounded-xl border border-white/15 bg-[#163848]/75 p-2.5 xl:col-span-6">
          <div className="min-h-0 flex-1">
            <DashboardMap
              lang="ID"
              points={mapPoints}
              center={currentCenter}
              zoom={currentZoom}
              geoJsonData={geoJsonData}
              focusPoint={forcedFocusPoint || (selectedRecord ? { lat: selectedRecord.lat, lng: selectedRecord.lng } : null)}
              containerClassName={EMBED_MAP_CONTAINER_CLASS}
              focusZoom={currentZoom}
              focusRequestKey={focusRequestKey}
              showResetFocus={Boolean(selectedRecordId)}
              onResetFocus={handleClearSelectedRecord}
              onSelectReport={handleSelectRecord}
              selectedZone={selectedKkp}
              selectedPos="all"
              patrolTeamPoints={patrolTeamPoints}
              findingPoints={findingPoints}
            />
          </div>
        </main>

        <HabitatDashboardRightPanel
          selectedRecord={selectedRecord}
          activeReportDraft={activeReportDraft}
          relatedDetailPhotos={relatedDetailPhotos}
          onDraftChange={handleDraftChange}
          onFocusLocation={handleFocusLocation}
          onReject={handleRejectSelectedRecord}
          onApprove={handleApproveSelectedRecord}
          onDelete={handleDeleteSelectedRecord}
          showDeleteAction={showDeleteAction}
          onToggleDeleteAction={() => setShowDeleteAction((prev) => !prev)}
        />
      </div>

      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) {
            setRejectReasonDraft("");
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#163848] text-white sm:max-w-[30rem]">
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Laporan</DialogTitle>
            <DialogDescription className="text-slate-300">
              Masukkan alasan kenapa laporan ini ditolak sebelum statusnya dipindahkan ke laporan tertunda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={rejectReasonDraft}
              onChange={(event) => setRejectReasonDraft(event.target.value)}
              placeholder="Tulis alasan penolakan laporan..."
              className="min-h-[8rem] border-white/10 bg-[#103242] text-white placeholder:text-slate-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReasonDraft("");
                }}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitRejectReason}
                disabled={!rejectReasonDraft.trim()}
                className="rounded-lg bg-[#8a4b1f] px-3 py-2 text-sm font-semibold text-orange-50 transition-colors hover:bg-[#a35724] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Simpan Alasan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HabitatDashboardPage() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState(DEFAULT_FILTER_RANGE.from);
  const [dateTo, setDateTo] = useState(DEFAULT_FILTER_RANGE.to);
  const [exportRows, setExportRows] = useState([]);

  const exportColumns = useMemo(
    () => [
      { key: "tanggal", label: "Tanggal" },
      { key: "kawasan", label: "Kawasan" },
      { key: "posJaga", label: "Pos Jaga" },
      { key: "lokasi", label: "Lokasi" },
      { key: "koordinator", label: "Koordinator" },
      { key: "speedboat", label: "Speedboat" },
      { key: "temuanManta", label: "Temuan Manta" },
      { key: "pelanggaran", label: "Pelanggaran" },
      { key: "jenisPelanggaran", label: "Jenis Pelanggaran" },
    ],
    []
  );

  const exportTitle = "Dashboard Monitoring Habitat";
  const exportFileName = buildExportFileName("monitoring-habitat", dateFrom, dateTo);

  return (
    <div className="grid h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-gradient-to-br from-[#0b3349] via-[#17454f] to-[#2f3f35] text-white">
      <MonitoringDashboardHeader
        title="Panel Dasboard Validasi Monitoring Habitat"
        subtitle="KAWASAN KONSERVASI DI PERAIRAN KEPULAUAN RAJA AMPAT"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateRangeChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        onExit={() => navigate("/")}
        onExportExcel={() =>
          exportRowsToExcel({
            fileName: exportFileName,
            title: exportTitle,
            columns: exportColumns,
            rows: exportRows,
          })
        }
        onExportPdf={() =>
          exportRowsToPdf({
            title: exportTitle,
            columns: exportColumns,
            rows: exportRows,
          })
        }
        hasExportData={exportRows.length > 0}
      />

      <div className="min-h-0 overflow-hidden">
        <div className="mt-0.5 h-full">
          <HabitatDashboardBody
            geoJsonData={fullGeoJson}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onExportRowsChange={setExportRows}
          />
        </div>
      </div>
    </div>
  );
}
