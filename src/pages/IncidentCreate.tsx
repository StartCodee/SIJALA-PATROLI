import { useNavigate } from 'react-router-dom';
import { FileWarning, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncidentForm } from '@/components/incidents/IncidentForm';

const IncidentCreate = () => {
  const navigate = useNavigate();

  return (
    <MainLayout title="Buat Laporan Kejadian" subtitle="Form pelaporan kejadian baru">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate('/incidents')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <Card className="shadow-card max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            Form Laporan Kejadian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentForm
            submitLabel="Simpan Laporan"
            onCancel={() => navigate('/incidents')}
            onSuccess={(incident) => navigate(`/incidents/${incident.id}`)}
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default IncidentCreate;
