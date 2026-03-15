import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ExternalLink, KeyRound, ShieldCheck, Users } from 'lucide-react';

const roleRows = [
  {
    role: 'superadmin',
    description: 'Akses penuh modul patroli dan pengaturan tingkat lanjut.',
  },
  {
    role: 'admin',
    description: 'Kelola data master patroli dan validasi laporan.',
  },
  {
    role: 'operator',
    description: 'Buat dan kelola laporan operasional sesuai area tugas.',
  },
  {
    role: 'viewer',
    description: 'Akses baca untuk monitoring dan ringkasan.',
  },
];

const UserManagementPage = () => {
  const auth = useAuth();
  const ssoPortalUrl = import.meta.env.VITE_SSO_PORTAL_URL || 'http://localhost:9000';

  return (
    <MainLayout
      title="Manajemen Pengguna"
      subtitle="Pusat akun dan hak akses berada di layanan SSO"
      showSearch={false}
    >
      <div className="space-y-6">
        <Card className="card-ocean">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Source Of Truth: SSO
            </CardTitle>
            <CardDescription>
              Seluruh proses register akun, aktivasi/nonaktif akun, reset password, dan assignment
              role dilakukan dari portal SSO agar konsisten untuk semua aplikasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Akun Anda saat ini: <span className="font-medium text-foreground">{auth.user?.email || '-'}</span>
              {' '}dengan role{' '}
              <span className="font-medium text-foreground">{String(auth.user?.role || 'viewer')}</span>.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="btn-ocean gap-2"
                onClick={() => window.open(ssoPortalUrl, '_blank', 'noopener,noreferrer')}
              >
                <Users className="h-4 w-4" />
                Buka Portal SSO
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => window.open(ssoPortalUrl, '_blank', 'noopener,noreferrer')}
              >
                <KeyRound className="h-4 w-4" />
                Kelola Password Di SSO
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-ocean">
          <CardHeader>
            <CardTitle className="text-lg">Role Aplikasi Patroli</CardTitle>
            <CardDescription>
              Mapping role berikut dipakai backend patroli untuk pembatasan endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 pr-4 font-medium">Role</th>
                    <th className="py-3 pr-4 font-medium">Hak Akses Utama</th>
                  </tr>
                </thead>
                <tbody>
                  {roleRows.map((item) => (
                    <tr key={item.role} className="border-b border-border/60">
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{item.role}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
