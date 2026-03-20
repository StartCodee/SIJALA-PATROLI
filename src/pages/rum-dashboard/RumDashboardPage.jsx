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
  buildInitialRumReportDraft,
  buildRumMediaRecord,
  EMBED_MAP_CONTAINER_CLASS,
  KKP_OPTIONS,
  POS_OPTIONS,
  mapCenter as rumMapCenter,
  mapZoom as rumMapZoom,
  fotoMegafauna,
  fotoSumberdayaTetap,
  fotoTangkapan,
  normalizeRumTimeValue,
  resolveRumApprovalDelaySeconds,
  resolveRumReportTime,
  RUM_FUEL_USAGE_LITERS_PER_POINT,
  rumPoints,
} from "@/data/rumData";
import RumDashboardLeftPanel from "./RumDashboardLeftPanel";
import RumDashboardRightPanel from "./RumDashboardRightPanel";

function RumDashboardBody({
  geoJsonData,
  showEmbedGenerator = false,
  dateFrom = DEFAULT_FILTER_RANGE.from,
  dateTo = DEFAULT_FILTER_RANGE.to,
  onExportRowsChange,
}) {
  const [selectedKkp, setSelectedKkp] = useState("all");
  const [selectedPos, setSelectedPos] = useState("all");
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

  const mediaRecords = useMemo(
    () => [
      ...fotoTangkapan.map((item) => buildRumMediaRecord(item, "tangkapan")),
      ...fotoSumberdayaTetap.map((item) => buildRumMediaRecord(item, "tetap")),
      ...fotoMegafauna.map((item) => buildRumMediaRecord(item, "megafauna")),
    ],
    []
  );

  const availablePosOptions = useMemo(() => {
    const allValues = new Set(
      rumPoints
        .filter((point) => selectedKkp === "all" || point.zone === selectedKkp)
        .map((point) => point.pos)
        .filter(Boolean)
    );

    mediaRecords.forEach((item) => {
      if ((selectedKkp === "all" || item.zoneValue === selectedKkp) && item.posValue) {
        allValues.add(item.posValue);
      }
    });

    return POS_OPTIONS.filter((option) => option.value === "all" || allValues.has(option.value));
  }, [mediaRecords, selectedKkp]);

  useEffect(() => {
    if (selectedPos !== "all" && !availablePosOptions.some((option) => option.value === selectedPos)) {
      setSelectedPos("all");
    }
  }, [availablePosOptions, selectedPos]);

  const filteredPoints = useMemo(
    () =>
      rumPoints.filter((point) => {
        if (selectedKkp !== "all" && point.zone !== selectedKkp) return false;
        if (selectedPos !== "all" && point.pos !== selectedPos) return false;
        if (!isDateInRange(getDateValue(point.date), dateFrom, dateTo)) return false;
        return true;
      }),
    [dateFrom, dateTo, selectedKkp, selectedPos]
  );

  const filteredMedia = useMemo(
    () =>
      mediaRecords
        .filter((item) => !deletedRecordIds.includes(item.id))
        .map((item) => ({
          ...item,
          statusKey: reportStatusOverrides[item.id] || item.statusKey,
        }))
        .filter((item) => {
        if (selectedKkp !== "all" && item.zoneValue !== selectedKkp) return false;
        if (selectedPos !== "all" && item.posValue !== selectedPos) return false;
        if (!isDateInRange(item.dateValue, dateFrom, dateTo)) return false;
        return true;
      }),
    [dateFrom, dateTo, deletedRecordIds, mediaRecords, reportStatusOverrides, selectedKkp, selectedPos]
  );

  const selectedRecord = useMemo(
    () =>
      filteredMedia.find((item) => item.id === selectedRecordId) ||
      mediaRecords.find((item) => item.id === selectedRecordId) ||
      null,
    [filteredMedia, mediaRecords, selectedRecordId]
  );

  useEffect(() => {
    if (selectedRecordId && !filteredMedia.some((item) => item.id === selectedRecordId)) {
      setSelectedRecordId("");
    }
  }, [filteredMedia, selectedRecordId]);

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
        [selectedRecord.id]: buildInitialRumReportDraft(selectedRecord),
      };
    });
  }, [selectedRecord]);

  const activeReportDraft = useMemo(() => {
    if (!selectedRecord) return null;
    return {
      ...buildInitialRumReportDraft(selectedRecord),
      ...(reportDrafts[selectedRecord.id] || {}),
    };
  }, [reportDrafts, selectedRecord]);

  const relatedDetailPhotos = useMemo(() => {
    if (!selectedRecord) return [];
    return filteredMedia
      .filter(
        (item) =>
          (item.posValue === selectedRecord.posValue || item.zoneValue === selectedRecord.zoneValue)
      )
      .slice(0, 6);
  }, [filteredMedia, selectedRecord]);

  const handleSelectRecord = (record) => {
    setSelectedRecordId(record.id);
    setShowDeleteAction(false);
    setForcedFocusPoint(record.coordinate || null);
    setFocusRequestKey((prev) => prev + 1);
  };

  const handleFocusFindingLocation = () => {
    if (!selectedRecord?.coordinate) return;
    setForcedFocusPoint(selectedRecord.coordinate);
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
        ...(prev[selectedRecord.id] || buildInitialRumReportDraft(selectedRecord)),
        [field]: value,
      },
    }));
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
    const trimmedReason = rejectReasonDraft.trim();
    if (!trimmedReason) return;

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

  const activeZonesCount = useMemo(
    () => new Set(filteredPoints.map((point) => point.zone)).size,
    [filteredPoints]
  );

  const exportRows = useMemo(
    () =>
      filteredMedia.map((item) => ({
        tanggal: formatReportDate(item.dateValue, resolveRumReportTime(item)),
        kategori: item.category || "-",
        kawasan: item.areaLabelRaw || item.locationLabel || "-",
        posJaga: item.posLabelRaw || "-",
        lokasi: item.locationLabel || "-",
        temuan: item.factLabel || "-",
      })),
    [filteredMedia]
  );

  useEffect(() => {
    onExportRowsChange?.(exportRows);
  }, [exportRows, onExportRowsChange]);

  const leftPanelFeed = useMemo(
    () =>
      [...filteredMedia]
        .sort((a, b) => {
          const dateCompare = String(b.dateValue || "").localeCompare(String(a.dateValue || ""));
          if (dateCompare !== 0) return dateCompare;
          return normalizeRumTimeValue(resolveRumReportTime(b)).localeCompare(
            normalizeRumTimeValue(resolveRumReportTime(a))
          );
        })
        .map((item) => ({
          ...item,
          areaLabel:
            item.areaLabelRaw ||
            (item.zoneValue
              ? KKP_OPTIONS.find((option) => option.value === item.zoneValue)?.label?.ID
              : "") ||
            item.locationLabel,
          posLabel:
            item.posLabelRaw ||
            (item.posValue
              ? POS_OPTIONS.find((option) => option.value === item.posValue)?.label?.ID
              : "") ||
            "-",
          dateText: formatReportDate(item.dateValue, item.reportTime || "08:00"),
        })),
    [filteredMedia]
  );

  const reportStatusFilters = [
    { key: "all", label: "Semua Laporan" },
    { key: "incoming", label: "Laporan Masuk" },
    { key: "pending", label: "Laporan Tertunda" },
    { key: "approved", label: "Laporan Selesai" },
  ];
  const totalReports = filteredMedia.filter((item) => item.statusKey === "incoming").length;
  const pendingReports = filteredMedia.filter((item) => item.statusKey === "pending").length;
  const approvedReports = filteredMedia.filter((item) => item.statusKey === "approved").length;
  const visibleLeftPanelFeed = useMemo(() => {
    if (reportListFilter === "all") return leftPanelFeed;
    return leftPanelFeed.filter((item) => item.statusKey === reportListFilter);
  }, [leftPanelFeed, reportListFilter]);
  const selectedReportStatusLabel =
    reportStatusFilters.find((item) => item.key === reportListFilter)?.label ||
    reportStatusFilters[0].label;
  const averageApprovalLatency = useMemo(() => {
    const approvedFeed = filteredMedia.filter((item) => item.statusKey === "approved");
    if (approvedFeed.length === 0) return "-";

    const totalLatencySeconds = approvedFeed.reduce(
      (sum, item) => sum + resolveRumApprovalDelaySeconds(item.id),
      0
    );
    return formatLatencyDuration(Math.round(totalLatencySeconds / approvedFeed.length));
  }, [filteredMedia]);

  const visibleReportMedia = useMemo(() => {
    if (reportListFilter === "all") return filteredMedia;
    return filteredMedia.filter((item) => item.statusKey === reportListFilter);
  }, [filteredMedia, reportListFilter]);

  const mapPoints = useMemo(
    () =>
      visibleReportMedia.map((item) => ({
        ...item,
        lat: item.coordinate?.lat ?? rumMapCenter[0],
        lng: item.coordinate?.lng ?? rumMapCenter[1],
        type: item.markerType,
        label: item.caption?.ID || item.locationLabel || item.id,
        zone: item.zoneValue,
        pos: item.posValue,
        date: item.dateValue,
        finding: item,
      })),
    [visibleReportMedia]
  );

  const findingPoints = useMemo(
    () =>
      visibleReportMedia
        .filter((item) => item.coordinate)
        .map((item) => ({
          id: `temuan-${item.id}`,
          lat: item.coordinate.lat,
          lng: item.coordinate.lng,
          label: item.locationLabel || item.caption?.ID || item.id,
          zone: item.zoneValue,
          pos: item.posValue,
          date: item.dateValue,
          markerType: "temuan",
          finding: item,
        })),
    [visibleReportMedia]
  );

  const currentCenter = useMemo(() => {
    if (forcedFocusPoint) {
      return [forcedFocusPoint.lat, forcedFocusPoint.lng];
    }
    if (selectedRecord?.coordinate) {
      return [selectedRecord.coordinate.lat, selectedRecord.coordinate.lng];
    }
    if (mapPoints.length === 0) return rumMapCenter;

    const avgLat = mapPoints.reduce((sum, point) => sum + point.lat, 0) / mapPoints.length;
    const avgLng = mapPoints.reduce((sum, point) => sum + point.lng, 0) / mapPoints.length;
    return [avgLat, avgLng];
  }, [forcedFocusPoint, mapPoints, selectedRecord]);

  const currentZoom = selectedRecord || forcedFocusPoint ? 12 : rumMapZoom;

  const conservationAreaHa = (activeZonesCount || 1) * 1428571.43;
  const fuelUsageLabel = `${formatIndonesiaNumber(filteredPoints.length * RUM_FUEL_USAGE_LITERS_PER_POINT)} L`;
  const patrolCoverage = filteredPoints.length * 83333.33;

  return (
    <>
      <div className="mx-auto h-full max-w-[115.625rem] px-2 pb-2 md:px-3">
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-12">
          <RumDashboardLeftPanel
            selectedKkp={selectedKkp}
            selectedPos={selectedPos}
            kkpOptions={KKP_OPTIONS}
            availablePosOptions={availablePosOptions}
            onKkpChange={setSelectedKkp}
            onPosChange={setSelectedPos}
            fuelUsageLabel={fuelUsageLabel}
            totalReports={totalReports}
            pendingReports={pendingReports}
            approvedReports={approvedReports}
            averageApprovalLatency={averageApprovalLatency}
            conservationAreaLabel={formatIndonesiaNumber(conservationAreaHa)}
            patrolCoverageLabel={formatIndonesiaNumber(patrolCoverage)}
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
                focusPoint={forcedFocusPoint || selectedRecord?.coordinate || null}
                containerClassName={EMBED_MAP_CONTAINER_CLASS}
                focusZoom={currentZoom}
                focusRequestKey={focusRequestKey}
                showResetFocus={Boolean(selectedRecordId)}
                onResetFocus={handleClearSelectedRecord}
                onSelectReport={handleSelectRecord}
                selectedZone={selectedKkp}
                selectedPos={selectedPos}
                patrolTeamPoints={filteredPoints}
                findingPoints={findingPoints}
              />
            </div>
          </main>

          <RumDashboardRightPanel
            selectedRecord={selectedRecord}
            activeReportDraft={activeReportDraft}
            relatedDetailPhotos={relatedDetailPhotos}
            onDraftChange={handleDraftChange}
            onFocusLocation={handleFocusFindingLocation}
            onReject={handleRejectSelectedRecord}
            onApprove={handleApproveSelectedRecord}
            onDelete={handleDeleteSelectedRecord}
            showDeleteAction={showDeleteAction}
            onToggleDeleteAction={() => setShowDeleteAction((prev) => !prev)}
          />
        </div>
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
    </>
  );
}

export default function RumDashboardPage() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState(DEFAULT_FILTER_RANGE.from);
  const [dateTo, setDateTo] = useState(DEFAULT_FILTER_RANGE.to);
  const [exportRows, setExportRows] = useState([]);

  const exportColumns = useMemo(
    () => [
      { key: "tanggal", label: "Tanggal" },
      { key: "kategori", label: "Kategori" },
      { key: "kawasan", label: "Kawasan" },
      { key: "posJaga", label: "Pos Jaga" },
      { key: "lokasi", label: "Lokasi" },
      { key: "temuan", label: "Temuan" },
    ],
    []
  );

  const exportTitle = "Dashboard Monitoring Pemanfaatan Sumberdaya";
  const exportFileName = buildExportFileName("monitoring-rum", dateFrom, dateTo);

  return (
    <div className="grid h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-gradient-to-br from-[#0b3349] via-[#17454f] to-[#2f3f35] text-white">
      <MonitoringDashboardHeader
        title="Panel Dasboard Validasi Monitoring Pemanfaatan Sumberdaya"
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
          <RumDashboardBody
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
