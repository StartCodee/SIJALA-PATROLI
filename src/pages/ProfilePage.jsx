import { MainLayout } from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Key, Mail, User } from 'lucide-react';
const ProfilePage = () => {
    return (<MainLayout title="Profil Akun" subtitle="Perbarui data profil dan keamanan akun" showSearch={false}>
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="card-ocean xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Foto Profil</CardTitle>
              <CardDescription>Perbarui foto agar akun mudah dikenali.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      RH
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow">
                    <Camera className="h-4 w-4"/>
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="photo">Unggah Foto</Label>
                  <Input id="photo" type="file" accept="image/*" className="mt-2 bg-background"/>
                  <p className="mt-2 text-xs text-muted-foreground">PNG/JPG, maksimal 2MB.</p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                Pastikan wajah jelas dan latar belakang netral.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 xl:col-span-2">
            <Card className="card-ocean">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Akun</CardTitle>
                <CardDescription>Perbarui nama dan email yang digunakan.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="name" defaultValue="Rudi Hartono" className="bg-background pl-9"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="email" type="email" defaultValue="rudi.hartono@kkp.go.id" className="bg-background pl-9"/>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-ocean">
              <CardHeader>
                <CardTitle className="text-lg">Keamanan</CardTitle>
                <CardDescription>Ganti password untuk menjaga keamanan akun.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="current-password" type="password" placeholder="Masukkan password saat ini" className="bg-background pl-9"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input id="new-password" type="password" placeholder="Minimal 8 karakter" className="bg-background"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Ulangi password baru" className="bg-background"/>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground md:col-span-2">
                  Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk keamanan lebih baik.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline">
            Batal
          </Button>
          <Button type="submit" className="btn-ocean">
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </MainLayout>);
};
export default ProfilePage;
