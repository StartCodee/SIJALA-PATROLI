import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, ExternalLink, Mail, Shield, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function initialsOf(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part.trim().charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';
}

const ProfilePage = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const ssoPortalUrl = import.meta.env.VITE_SSO_PORTAL_URL || '/sso';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [markPhotoRemoved, setMarkPhotoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = auth.user;
    const currentName = user?.fullName || user?.name || '';
    setFullName(String(currentName));
    setEmail(String(user?.email || ''));
    setRole(String(user?.role || 'viewer'));
    setPhotoUrl(String(user?.photoUrl || ''));
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setMarkPhotoRemoved(false);
  }, [auth.user]);

  useEffect(() => {
    if (!photoFile) return undefined;
    const nextPreviewUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [photoFile]);

  const displayedPhoto = photoPreviewUrl || (markPhotoRemoved ? '' : photoUrl);
  const currentName = String(auth.user?.fullName || auth.user?.name || '').trim();
  const normalizedFullName = fullName.trim();
  const canSave =
    normalizedFullName.length >= 2 &&
    (
      normalizedFullName !== currentName ||
      Boolean(photoFile) ||
      markPhotoRemoved
    );

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Ukuran foto terlalu besar',
        description: 'Maksimal ukuran foto profil adalah 2MB.',
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    setPhotoFile(file);
    setMarkPhotoRemoved(false);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setMarkPhotoRemoved(true);
  };

  const handleReset = () => {
    const user = auth.user;
    setFullName(String(user?.fullName || user?.name || ''));
    setEmail(String(user?.email || ''));
    setRole(String(user?.role || 'viewer'));
    setPhotoUrl(String(user?.photoUrl || ''));
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setMarkPhotoRemoved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (normalizedFullName.length < 2) {
      toast({
        title: 'Validasi gagal',
        description: 'Nama minimal 2 karakter.',
        variant: 'destructive',
      });
      return;
    }

    if (!canSave) {
      toast({
        title: 'Tidak ada perubahan',
        description: 'Silakan ubah nama atau foto terlebih dahulu.',
      });
      return;
    }

    setSaving(true);
    try {
      if (normalizedFullName !== currentName) {
        await apiClient.updateMyProfile({ fullName: normalizedFullName });
      }

      if (photoFile) {
        await apiClient.uploadMyProfilePhoto(photoFile);
      } else if (markPhotoRemoved) {
        await apiClient.deleteMyProfilePhoto();
      }

      await auth.refreshMe();

      toast({
        title: 'Profil diperbarui',
        description: 'Data profil Anda berhasil disimpan.',
      });
    } catch (error) {
      toast({
        title: 'Gagal menyimpan profil',
        description: String(error?.message || 'Terjadi kesalahan saat memperbarui profil.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Profil Akun" subtitle="Perbarui data profil akun patroli" showSearch={false}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="card-ocean xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Foto Profil</CardTitle>
              <CardDescription>Foto profil akan tampil di sidebar dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                    {displayedPhoto ? <AvatarImage src={displayedPhoto} alt={fullName} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {initialsOf(fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="photo">Unggah Foto</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="mt-2 bg-background"
                    onChange={handlePhotoChange}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">PNG/JPG/WEBP, maksimal 2MB.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleRemovePhoto}>
                  Hapus Foto
                </Button>
                <p className="text-xs text-muted-foreground">Perubahan berlaku setelah Anda klik Simpan.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 xl:col-span-2">
            <Card className="card-ocean">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Akun</CardTitle>
                <CardDescription>Nama dapat diperbarui langsung dari dashboard patroli.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="bg-background pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" value={email} className="bg-background pl-9" disabled />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email sumber dari SSO dan tidak bisa diubah di aplikasi ini.
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Role</Label>
                  <Input value={role} className="bg-background" disabled />
                </div>
              </CardContent>
            </Card>

            <Card className="card-ocean">
              <CardHeader>
                <CardTitle className="text-lg">Keamanan & Akses</CardTitle>
                <CardDescription>
                  Password, role, dan manajemen akun terpusat di layanan SSO.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Untuk ganti password, aktivasi/nonaktifkan akun, dan pengaturan hak akses,
                  gunakan portal SSO.
                </div>
                <Button type="button" variant="outline" className="gap-2" onClick={() => window.open(ssoPortalUrl, '_blank', 'noopener,noreferrer')}>
                  <Shield className="w-4 h-4" />
                  Buka Portal SSO
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" className="btn-ocean" disabled={saving || !canSave}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
};

export default ProfilePage;
