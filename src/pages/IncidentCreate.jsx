import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileWarning } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const IncidentCreate = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      title="Laporan Kejadian"
      subtitle="Laporan kejadian dibuat otomatis dari temuan pelanggaran pada form patroli"
    >
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/incidents')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <Card className="shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            Input Manual Dinonaktifkan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Untuk menjaga konsistensi data, laporan kejadian tidak dibuat manual di dashboard.
            Kejadian akan muncul otomatis jika pada form patroli mobile terdapat temuan dengan
            pelanggaran.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/patrols')}>
              Buka Daftar Patroli
            </Button>
            <Button onClick={() => navigate('/incidents')}>Buka Daftar Kejadian</Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default IncidentCreate;