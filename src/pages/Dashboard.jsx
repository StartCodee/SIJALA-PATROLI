import { useEffect, useMemo, useState } from 'react';
import { FileWarning, CheckCircle2, AlertTriangle, Clock, Route, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICard } from '@/components/shared/KPICard';
import { MapCard } from '@/components/map/MapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  apiClient,
  formatDateTime,
  reviewClassMap,
  reviewLabelMap,
} from '@/lib/apiClient';
import {
  getReportRoute,
  getReportSummaryLine,
  getReportTypeLabel,
} from '@/lib/reportPresentation';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, reportData] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getReports(),
      ]);

      setSummary(summaryData);
      setReports(reportData.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat dashboard',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentReports = useMemo(() => reports.slice(0, 8), [reports]);

  const pendingPatrols = useMemo(
    () => reports.filter((item) => item.type === 'PATROL_JAGA_LAUT' && item.status === 'pending').slice(0, 4),
    [reports],
  );

  const reportTypeCounts = useMemo(
    () =>
      reports.reduce(
        (accumulator, item) => {
          if (item.type === 'PATROL_JAGA_LAUT') accumulator.patrol += 1;
          else if (item.type === 'RESOURCE_USE_MONITORING') accumulator.resourceUse += 1;
          else if (item.type === 'OTHER_MONITORING') accumulator.habitat += 1;
          return accumulator;
        },
        { patrol: 0, resourceUse: 0, habitat: 0 },
      ),
    [reports],
  );

  return (
    <MainLayout title="Dashboard" subtitle="Ringkasan laporan patroli & monitoring">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Laporan"
          value={summary?.totalReports ?? 0}
          icon={FileWarning}
          variant="primary"
        />
        <KPICard
          title="Menunggu Verifikasi"
          value={summary?.byStatus?.pending ?? 0}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Sudah Diterima"
          value={summary?.byStatus?.validated ?? 0}
          icon={CheckCircle2}
          variant="success"
        />
        <KPICard
          title="Dikembalikan"
          value={summary?.byStatus?.rejected ?? 0}
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapCard title="Ringkasan Monitoring" showControls={false} className="h-full">
            <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success animate-pulse" />
                <span className="text-sm font-medium">
                  {summary?.byStatus?.pending ?? 0} laporan menunggu verifikasi
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Patroli: {reportTypeCounts.patrol}</span>
                <span>RUM: {reportTypeCounts.resourceUse}</span>
                <span>Habitat: {reportTypeCounts.habitat}</span>
              </div>
            </div>
          </MapCard>
        </div>

        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Laporan Terbaru
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/patrols')} className="text-xs">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="w-full overflow-x-hidden p-3">
                <div className="space-y-2">
                  {recentReports.map((item) => (
                    <div
                      key={item.id}
                      className="group w-full min-w-0 rounded-lg border border-transparent bg-card px-4 py-3 transition-all hover:border-primary/20 hover:bg-primary/5 cursor-pointer"
                      onClick={() => navigate(getReportRoute(item))}
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate">{item.reportCode}</h4>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              {getReportTypeLabel(item.type)}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                            <span>{formatDateTime(item.submittedAt)}</span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground truncate">
                            {[item.areaName, item.postName].filter(Boolean).join(' · ') || 'Tanpa konteks area'}
                          </p>
                          <p className="mt-1 text-xs text-foreground/80 line-clamp-2">
                            {getReportSummaryLine(item)}
                          </p>
                        </div>
                        <div className="ml-auto shrink-0">
                          <Badge className={`border ${reviewClassMap[item.status]}`}>
                            {reviewLabelMap[item.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentReports.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      {loading ? 'Memuat data...' : 'Belum ada laporan.'}
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Patroli Menunggu Verifikasi
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patrols')} className="text-xs">
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pendingPatrols.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => navigate(getReportRoute(item))}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={`border ${reviewClassMap[item.status]}`}>
                    {reviewLabelMap[item.status]}
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground">{item.reportCode}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.areaName}</p>
                <p className="text-xs text-muted-foreground mt-2">{item.submittedBy}</p>
                <p className="text-xs text-foreground/80 mt-2">{getReportSummaryLine(item)}</p>
              </div>
            ))}
          </div>

          {pendingPatrols.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {loading ? 'Memuat data...' : 'Tidak ada patroli pending.'}
            </p>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
