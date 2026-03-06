import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Phone, User } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusChip } from '@/components/StatusChip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient, formatDateTime } from '@/lib/apiClient';

const roleLabels = {
  kapten: 'Kapten',
  navigator: 'Navigator',
  teknisi: 'Teknisi',
  operator: 'Operator',
  medis: 'Medis',
  petugas: 'Petugas',
};

const statusLabels = {
  aktif: 'Aktif',
  cuti: 'Cuti',
  nonaktif: 'Nonaktif',
};

const statusVariant = (status) => {
  if (status === 'aktif') return 'approved';
  if (status === 'cuti') return 'pending';
  return 'rejected';
};

const CrewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [member, setMember] = useState(null);
  const [guardPosts, setGuardPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [memberData, postResponse] = await Promise.all([
        apiClient.getCrewById(id),
        apiClient.getGuardPosts(),
      ]);
      setMember(memberData);
      setGuardPosts(postResponse.items || []);
    } catch (error) {
      toast({
        title: 'Gagal memuat detail personel',
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
  }, [id]);

  const post = useMemo(() => {
    if (!member?.basePostId) return null;
    return guardPosts.find((item) => item.id === member.basePostId) || null;
  }, [guardPosts, member]);

  if (loading && !member) {
    return (
      <MainLayout title="Detail Personel">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">Memuat data personel...</CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!member) {
    return (
      <MainLayout title="Personel Tidak Ditemukan">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Data personel tidak ditemukan.</p>
            <Button className="mt-4" onClick={() => navigate('/crew')}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const initials = member.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <MainLayout title={member.name} subtitle={roleLabels[member.role]}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/crew')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profil Personel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{roleLabels[member.role]}</p>
                <div className="mt-2">
                  <StatusChip
                    variant={statusVariant(member.status)}
                    label={statusLabels[member.status]}
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                <span>{(member.certifications || []).join(', ') || '-'}</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Aktiv terakhir {formatDateTime(member.lastActiveAt)}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Pos Jaga
              </CardTitle>
            </CardHeader>
            <CardContent>
              {post ? (
                <div className="space-y-2">
                  <p className="font-semibold">{post.name}</p>
                  <p className="text-sm text-muted-foreground">{post.address}</p>
                  <p className="text-sm text-muted-foreground">Kontak: {post.contact}</p>
                  <p className="text-xs text-muted-foreground">
                    Koordinat {post.location.lat.toFixed(4)}, {post.location.lon.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada pos jaga yang ditetapkan.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Penugasan Patroli</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Modul penugasan patroli belum dihubungkan ke API baru.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CrewDetail;
