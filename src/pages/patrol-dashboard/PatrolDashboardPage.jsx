import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MonitoringDashboardHeader from "@/components/dashboard/MonitoringDashboardHeader";
import DashboardMap from "@/components/map/DashboardMap";
import fullGeoJson from "@/data/geojson/fullGeo.json";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_FILTER_RANGE,
  findOptionValueByLabel,
  formatIndonesiaNumber,
  formatLatencyDuration,
  formatReportDate,
  getDateValue,
  isDateInRange,
  parseCoordinatePair,
} from "@/utils/monitoringFilterUtils";
import { buildExportFileName, exportRowsToExcel, exportRowsToPdf } from "@/utils/dashboardExportUtils";
import {
  KKP_OPTIONS,
  POS_OPTIONS,
  findingDetails,
  mapCenter as patrolMapCenter,
  mapZoom as patrolMapZoom,
  patrolPoints,
} from "@/data/sispandalwasData";
import {
  buildInitialReportDraft,
  DUMMY_INCOMING_PATROL_REPORTS,
  FUEL_USAGE_LITERS_BY_PATROL_ID,
  formatFindingCoordinateText,
  resolveApprovalDelaySeconds,
  resolveFindingStatusKey,
  resolvePatrolReportMeta,
} from "@/data/patrolDashboardData";
import PatrolDashboardLeftPanel from "./PatrolDashboardLeftPanel";
import PatrolDashboardRightPanel from "./PatrolDashboardRightPanel";

const MAP_CONTAINER_CLASS = "min-h-[22rem] h-[22rem] sm:h-[26rem] md:h-[30rem] lg:h-[34rem] xl:h-full";

function distance(a, b) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

export default function PatrolDashboardPage() {
  const navigate = useNavigate();
  const [selectedKkp, setSelectedKkp] = useState("all");
  const [selectedPos, setSelectedPos] = useState("all");
  const [dateFrom, setDateFrom] = useState(DEFAULT_FILTER_RANGE.from);
  const [dateTo, setDateTo] = useState(DEFAULT_FILTER_RANGE.to);
  const [reportListFilter, setReportListFilter] = useState("all");
  const [mapFocusTarget, setMapFocusTarget] = useState("report");
  const [selectedFindingId, setSelectedFindingId] = useState("");
  const [focusRequestKey, setFocusRequestKey] = useState(0);
  const [reportStatusOverrides, setReportStatusOverrides] = useState({});
  const [reportDrafts, setReportDrafts] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [deletedFindingIds, setDeletedFindingIds] = useState([]);
  const [showDeleteAction, setShowDeleteAction] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState("");

  const findingMetaBase = useMemo(
    () =>
      [...DUMMY_INCOMING_PATROL_REPORTS, ...findingDetails].map((item) => {
        const areaLabel = item?.detail?.kawasanTemuan?.ID || "";
        const posLabel = item?.detail?.posTemuan?.ID || "";
        const posValue = findOptionValueByLabel(POS_OPTIONS, posLabel);
        const reportMeta = resolvePatrolReportMeta(posValue);
        const statusLabel = item?.summary?.statusPelanggaran?.ID || "";

        return {
          ...item,
          areaLabel,
          posLabel,
          zoneValue: findOptionValueByLabel(KKP_OPTIONS, areaLabel),
          posValue,
          coordinate: parseCoordinatePair(item?.summary?.koordinat),
          dateValue: getDateValue(item?.detail?.tanggal),
          koordinatorLabel: reportMeta.koordinatorLabel || "-",
          speedboatLabel: reportMeta.speedboatLabel || "-",
          statusLabel,
          statusKey: resolveFindingStatusKey(statusLabel),
        };
      }),
    []
  );

  const findingMeta = useMemo(
    () =>
      findingMetaBase
        .filter((item) => !deletedFindingIds.includes(item.id))
        .map((item) => ({
          ...item,
          statusKey: reportStatusOverrides[item.id] || item.statusKey,
        })),
    [deletedFindingIds, findingMetaBase, reportStatusOverrides]
  );

  const availablePosOptions = useMemo(() => {
    const allValues = new Set(
      patrolPoints
        .filter((point) => selectedKkp === "all" || point.zone === selectedKkp)
        .map((point) => point.pos)
        .filter(Boolean)
    );

    findingMeta.forEach((item) => {
      if ((selectedKkp === "all" || item.zoneValue === selectedKkp) && item.posValue) {
        allValues.add(item.posValue);
      }
    });

    return POS_OPTIONS.filter((option) => option.value === "all" || allValues.has(option.value));
  }, [findingMeta, selectedKkp]);

  useEffect(() => {
    if (selectedPos !== "all" && !availablePosOptions.some((option) => option.value === selectedPos)) {
      setSelectedPos("all");
    }
  }, [availablePosOptions, selectedPos]);

  const selectedFinding = useMemo(
    () => findingMeta.find((item) => item.id === selectedFindingId) || null,
    [findingMeta, selectedFindingId]
  );

  const filteredPatrolRoutes = useMemo(
    () =>
      patrolPoints.filter((point) => {
        if (point.type === "violation") return false;
        if (selectedKkp !== "all" && point.zone !== selectedKkp) return false;
        if (selectedPos !== "all" && point.pos !== selectedPos) return false;
        if (!isDateInRange(getDateValue(point.date), dateFrom, dateTo)) return false;
        return true;
      }),
    [dateFrom, dateTo, selectedKkp, selectedPos]
  );

  const filteredFindings = useMemo(
    () =>
      findingMeta.filter((item) => {
        if (selectedKkp !== "all" && item.zoneValue !== selectedKkp) return false;
        if (selectedPos !== "all" && item.posValue !== selectedPos) return false;
        if (!isDateInRange(item.dateValue, dateFrom, dateTo)) return false;
        return true;
      }),
    [dateFrom, dateTo, findingMeta, selectedKkp, selectedPos]
  );

  const filteredMapPoints = useMemo(
    () =>
      filteredFindings
        .filter((item) => item.coordinate)
        .map((item) => ({
          id: item.id,
          lat: item.coordinate.lat,
          lng: item.coordinate.lng,
          label: item.caption?.ID || item.summary?.lokasi?.ID || "-",
          zone: item.zoneValue,
          pos: item.posValue,
          date: item.dateValue,
          type: "report",
          markerType: "report",
          statusKey: item.statusKey,
          finding: item,
        })),
    [filteredFindings]
  );

  const visibleReportMapPoints = useMemo(
    () =>
      reportListFilter === "all"
        ? filteredMapPoints
        : filteredMapPoints.filter((item) => item.statusKey === reportListFilter),
    [filteredMapPoints, reportListFilter]
  );

  const selectedFindingCoordinateText = useMemo(() => {
    if (!selectedFinding) return "";
    return (
      reportDrafts[selectedFinding.id]?.coordinateText ||
      formatFindingCoordinateText(
        selectedFinding?.summary?.koordinat || `${selectedFinding?.detail?.lintang || "-"};${selectedFinding?.detail?.bujur || "-"}`
      )
    );
  }, [reportDrafts, selectedFinding]);

  const focusPoint = useMemo(() => {
    if (!selectedFinding) return null;
    if (mapFocusTarget === "finding") {
      return parseCoordinatePair(selectedFindingCoordinateText) || selectedFinding.coordinate || null;
    }
    return selectedFinding.coordinate || null;
  }, [mapFocusTarget, selectedFinding, selectedFindingCoordinateText]);

  const selectedFindingMapCoordinate = useMemo(() => {
    if (!selectedFinding) return null;
    return parseCoordinatePair(selectedFindingCoordinateText) || selectedFinding.coordinate || null;
  }, [selectedFinding, selectedFindingCoordinateText]);

  const visibleFindingMarkerPoints = useMemo(
    () =>
      visibleReportMapPoints.map((item) => {
        const isSelectedFinding = selectedFinding?.id === item.id;
        const findingCoordinate =
          isSelectedFinding && selectedFindingMapCoordinate
            ? selectedFindingMapCoordinate
            : { lat: item.lat, lng: item.lng };

        return {
          id: `temuan-${item.id}`,
          lat: findingCoordinate.lat,
          lng: findingCoordinate.lng,
          label: item.label,
          zone: item.zone,
          pos: item.pos,
          date: item.date,
          markerType: "temuan",
          finding: item.finding,
        };
      }),
    [selectedFinding?.id, selectedFindingMapCoordinate, visibleReportMapPoints]
  );

  const currentCenter = useMemo(() => {
    if (selectedFinding?.coordinate) return [selectedFinding.coordinate.lat, selectedFinding.coordinate.lng];
    const sourcePoints = filteredMapPoints.length > 0 ? filteredMapPoints : filteredPatrolRoutes;
    if (sourcePoints.length === 0) return patrolMapCenter;
    const avgLat = sourcePoints.reduce((sum, point) => sum + point.lat, 0) / sourcePoints.length;
    const avgLng = sourcePoints.reduce((sum, point) => sum + point.lng, 0) / sourcePoints.length;
    return [avgLat, avgLng];
  }, [filteredMapPoints, filteredPatrolRoutes, selectedFinding]);

  const currentZoom = useMemo(() => {
    if (selectedFinding) return mapFocusTarget === "finding" ? 9 : 10;
    if (selectedKkp === "all" && selectedPos === "all") return patrolMapZoom;
    return filteredMapPoints.length <= 1 ? 10 : 9;
  }, [filteredMapPoints.length, mapFocusTarget, selectedFinding, selectedKkp, selectedPos]);

  const totalFuelUsage = useMemo(
    () =>
      filteredPatrolRoutes.reduce((sum, item) => sum + Number(FUEL_USAGE_LITERS_BY_PATROL_ID[item.id] || 0), 0),
    [filteredPatrolRoutes]
  );

  const fuelUsageLabel = `${formatIndonesiaNumber(totalFuelUsage)} L`;

  const leftPanelFeed = useMemo(
    () =>
      [...filteredFindings]
        .filter((item) => reportListFilter === "all" || item.statusKey === reportListFilter)
        .sort((a, b) => String(b.dateValue || "").localeCompare(String(a.dateValue || "")))
        .map((item) => {
          const timeMatch = String(item.summary?.waktuTemuan || "").match(/(\d{1,2}:\d{2})/);

          return {
            ...item,
            areaLabel: item.areaLabel || "-",
            posLabel: item.posLabel || "-",
            koordinatorLabel: item.koordinatorLabel || "-",
            speedboatLabel: item.speedboatLabel || "-",
            rejectionReason: rejectionReasons[item.id] || "",
            dateText: formatReportDate(item.dateValue || "", timeMatch?.[1] || "08:00"),
            hasFinding: true,
            hasViolation: Boolean(item.violationTypeKey),
          };
        }),
    [filteredFindings, rejectionReasons, reportListFilter]
  );

  useEffect(() => {
    setShowDeleteAction(false);
  }, [selectedFindingId]);

  useEffect(() => {
    if (selectedFindingId && !filteredFindings.some((item) => item.id === selectedFindingId)) {
      setSelectedFindingId("");
    }
  }, [filteredFindings, selectedFindingId]);

  const handleSelectFinding = (finding) => {
    setSelectedFindingId(finding.id);
    setMapFocusTarget("report");
    setFocusRequestKey((prev) => prev + 1);
  };

  const handleClearFocusedFinding = () => {
    setSelectedFindingId("");
    setMapFocusTarget("report");
  };

  const handleRejectSelectedFinding = () => {
    if (!selectedFinding) return;
    setRejectReasonDraft(rejectionReasons[selectedFinding.id] || "");
    setShowRejectDialog(true);
  };

  const handleApproveSelectedFinding = () => {
    if (!selectedFinding) return;
    setReportStatusOverrides((prev) => ({ ...prev, [selectedFinding.id]: "approved" }));
    setSelectedFindingId("");
  };

  const handleDeleteSelectedFinding = () => {
    if (!selectedFinding) return;
    setDeletedFindingIds((prev) => [...prev, selectedFinding.id]);
    setSelectedFindingId("");
  };

  const handleSubmitRejectReason = () => {
    if (!selectedFinding) return;

    const trimmedReason = rejectReasonDraft.trim();
    if (!trimmedReason) return;

    setRejectionReasons((prev) => ({ ...prev, [selectedFinding.id]: trimmedReason }));
    setReportStatusOverrides((prev) => ({ ...prev, [selectedFinding.id]: "pending" }));
    setShowRejectDialog(false);
    setRejectReasonDraft("");
    setSelectedFindingId("");
  };

  const focusedPatrolRoute = useMemo(() => {
    if (!selectedFinding?.coordinate) return null;

    const samePostRoutes = filteredPatrolRoutes.filter((point) => point.pos === selectedFinding.posValue);
    const candidateRoutes = samePostRoutes.length > 0 ? samePostRoutes : filteredPatrolRoutes;
    if (candidateRoutes.length === 0) return null;

    return [...candidateRoutes].sort(
      (a, b) => distance(a, selectedFinding.coordinate) - distance(b, selectedFinding.coordinate)
    )[0];
  }, [filteredPatrolRoutes, selectedFinding]);

  const activeReportDraft = useMemo(() => {
    if (!selectedFinding) return null;
    return reportDrafts[selectedFinding.id] || buildInitialReportDraft(selectedFinding, focusedPatrolRoute);
  }, [focusedPatrolRoute, reportDrafts, selectedFinding]);

  const relatedDetailPhotos = useMemo(() => {
    if (!selectedFinding) return [];

    const related = [
      selectedFinding,
      ...filteredFindings.filter(
        (item) =>
          item.id !== selectedFinding.id &&
          (item.posValue === selectedFinding.posValue || item.zoneValue === selectedFinding.zoneValue)
      ),
    ];

    return related.slice(0, 5);
  }, [filteredFindings, selectedFinding]);

  useEffect(() => {
    if (!selectedFinding) return;

    setReportDrafts((prev) => {
      if (prev[selectedFinding.id]) return prev;
      return {
        ...prev,
        [selectedFinding.id]: buildInitialReportDraft(selectedFinding, focusedPatrolRoute),
      };
    });
  }, [focusedPatrolRoute, selectedFinding]);

  const handleDraftChange = (field, value) => {
    if (!selectedFinding) return;
    setReportDrafts((prev) => ({
      ...prev,
      [selectedFinding.id]: {
        ...(prev[selectedFinding.id] || buildInitialReportDraft(selectedFinding, focusedPatrolRoute)),
        [field]: value,
      },
    }));
  };

  const handleFocusFindingLocation = () => {
    if (!selectedFinding) return;
    setMapFocusTarget("finding");
    setFocusRequestKey((prev) => prev + 1);
  };

  const exportColumns = useMemo(
    () => [
      { key: "tanggal", label: "Tanggal" },
      { key: "waktu", label: "Waktu" },
      { key: "kawasan", label: "Kawasan" },
      { key: "posJaga", label: "Pos Jaga" },
      { key: "lokasi", label: "Lokasi" },
      { key: "koordinat", label: "Koordinat" },
      { key: "temuan", label: "Temuan" },
      { key: "status", label: "Status" },
    ],
    []
  );

  const exportRows = useMemo(
    () =>
      filteredFindings.map((item) => ({
        tanggal: item?.detail?.tanggal || item.dateValue || "-",
        waktu: item?.summary?.waktuTemuan || "-",
        kawasan: item.areaLabel || "-",
        posJaga: item.posLabel || "-",
        lokasi: item?.summary?.lokasi?.ID || "-",
        koordinat: item?.summary?.koordinat || "-",
        temuan: item?.caption?.ID || "-",
        status: item?.summary?.statusPelanggaran?.ID || "-",
      })),
    [filteredFindings]
  );

  const exportTitle = "Dashboard Patroli";
  const exportFileName = buildExportFileName("dashboard-patroli", dateFrom, dateTo);
  const totalReports = filteredFindings.filter((item) => item.statusKey === "incoming").length;
  const pendingReports = filteredFindings.filter((item) => item.statusKey === "pending").length;
  const approvedReports = filteredFindings.filter((item) => item.statusKey === "approved").length;
  const reportStatusFilters = [
    { key: "all", label: "Semua Laporan" },
    { key: "incoming", label: "Laporan Masuk" },
    { key: "pending", label: "Laporan Tertunda" },
    { key: "approved", label: "Laporan Selesai" },
  ];
  const selectedReportStatusLabel =
    reportStatusFilters.find((item) => item.key === reportListFilter)?.label || reportStatusFilters[0].label;

  const averageApprovalLatency = useMemo(() => {
    const approvedFeed = filteredFindings.filter((item) => item.statusKey === "approved");
    if (approvedFeed.length === 0) return "-";

    const totalLatencySeconds = approvedFeed.reduce((sum, item) => sum + resolveApprovalDelaySeconds(item.id), 0);
    return formatLatencyDuration(Math.round(totalLatencySeconds / approvedFeed.length));
  }, [filteredFindings]);

  const conservationAreaLabel = formatIndonesiaNumber(
    (new Set(filteredPatrolRoutes.map((point) => point.zone)).size || 1) * 1428571.43
  );
  const patrolCoverageLabel = formatIndonesiaNumber(filteredPatrolRoutes.length * 83333.33);

  return (
    <>
      <div className="grid h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-gradient-to-br from-[#0b3349] via-[#17454f] to-[#2f3f35] text-white">
        <MonitoringDashboardHeader
          title="Panel Dasboard Validasi Data SIJALA"
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
          <div className="mx-auto mt-0.5 h-full w-full max-w-[115.625rem] px-2 pb-2 md:px-3">
            <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-12">
              <PatrolDashboardLeftPanel
                kkpOptions={KKP_OPTIONS}
                selectedKkp={selectedKkp}
                selectedPos={selectedPos}
                availablePosOptions={availablePosOptions}
                onKkpChange={setSelectedKkp}
                onPosChange={setSelectedPos}
                fuelUsageLabel={fuelUsageLabel}
                totalReports={totalReports}
                pendingReports={pendingReports}
                approvedReports={approvedReports}
                averageApprovalLatency={averageApprovalLatency}
                conservationAreaLabel={conservationAreaLabel}
                patrolCoverageLabel={patrolCoverageLabel}
                selectedFindingId={selectedFindingId}
                onResetFocus={handleClearFocusedFinding}
                reportListFilter={reportListFilter}
                onReportListFilterChange={setReportListFilter}
                reportStatusFilters={reportStatusFilters}
                selectedReportStatusLabel={selectedReportStatusLabel}
                leftPanelFeed={leftPanelFeed}
                onSelectFinding={handleSelectFinding}
              />

              <main className="flex min-h-0 flex-col rounded-xl border border-white/15 bg-[#163848]/75 p-2.5 xl:col-span-6">
                <div className="min-h-0 flex-1">
                  <DashboardMap
                    lang="ID"
                    points={visibleReportMapPoints}
                    center={currentCenter}
                    zoom={currentZoom}
                    geoJsonData={fullGeoJson}
                    containerClassName={MAP_CONTAINER_CLASS}
                    focusPoint={focusPoint}
                    focusZoom={currentZoom}
                    focusRequestKey={focusRequestKey}
                    showResetFocus={Boolean(selectedFindingId)}
                    onResetFocus={handleClearFocusedFinding}
                    onSelectReport={handleSelectFinding}
                    selectedZone={selectedKkp}
                    selectedPos={selectedPos}
                    patrolTeamPoints={filteredPatrolRoutes}
                    findingPoints={visibleFindingMarkerPoints}
                  />
                </div>
              </main>

              <PatrolDashboardRightPanel
                selectedFinding={selectedFinding}
                activeReportDraft={activeReportDraft}
                relatedDetailPhotos={relatedDetailPhotos}
                onDraftChange={handleDraftChange}
                onFocusLocation={handleFocusFindingLocation}
                onReject={handleRejectSelectedFinding}
                onApprove={handleApproveSelectedFinding}
                onDelete={handleDeleteSelectedFinding}
                showDeleteAction={showDeleteAction}
                onToggleDeleteAction={() => setShowDeleteAction((prev) => !prev)}
              />
            </div>
          </div>
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
