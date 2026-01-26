import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RoleBadge, UserStatusChip } from '@/components/StatusChip';
import { dummyAdminUsers, formatDateTime, formatShortId, } from '@/data/adminData';
import { ChevronDown, ChevronUp, Edit, Filter, Key, Mail, MoreHorizontal, Plus, Search, Shield, UserCheck, UserX, } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
const UserManagementPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [permissions, setPermissions] = useState([
        { perm: 'Lihat Ringkasan Dasbor', admin: true, petugas: true },
        { perm: 'Pemantauan Langsung', admin: true, petugas: true },
        { perm: 'Kelola Data Kapal', admin: true, petugas: true },
        { perm: 'Kelola Patroli', admin: true, petugas: true },
        { perm: 'Kelola Laporan Kejadian', admin: true, petugas: true },
        { perm: 'Buat Laporan Kejadian', admin: true, petugas: true },
        { perm: 'Kelola Temuan', admin: true, petugas: true },
        { perm: 'Kelola Pengguna', admin: true, petugas: false },
        { perm: 'Lihat Log Aktivitas', admin: true, petugas: true },
        { perm: 'Ubah Pengaturan Sistem', admin: true, petugas: false },
    ]);
    const filteredUsers = dummyAdminUsers.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
    const stats = {
        total: dummyAdminUsers.length,
        active: dummyAdminUsers.filter((u) => u.status === 'active').length,
        disabled: dummyAdminUsers.filter((u) => u.status === 'disabled').length,
    };
    const openEdit = (user) => {
        setSelectedUser(user);
        setShowEditDialog(true);
    };
    const handlePermissionToggle = (index, key, checked) => {
        setPermissions((prev) => prev.map((item, idx) => idx === index
            ? {
                ...item,
                [key]: Boolean(checked),
            }
            : item));
    };
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    return (<MainLayout title="Manajemen Pengguna" subtitle="Kelola akun admin dan izin peran" showSearch={false}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="card-ocean p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Pengguna</p>
              </div>
              <Shield className="w-8 h-8 text-primary/30"/>
            </div>
          </Card>
          <Card className="card-ocean p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-status-approved">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktif</p>
              </div>
              <UserCheck className="w-8 h-8 text-status-approved/30"/>
            </div>
          </Card>
          <Card className="card-ocean p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-status-rejected">{stats.disabled}</p>
                <p className="text-xs text-muted-foreground">Nonaktif</p>
              </div>
              <UserX className="w-8 h-8 text-status-rejected/30"/>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input placeholder="Cari nama atau email..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9 bg-card"/>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="w-4 h-4"/>
            Filter
            {showFilters ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
          </Button>
          <Button className="btn-ocean gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4"/>
            Tambah Pengguna
          </Button>
        </div>

        {showFilters && (<Card className="card-ocean animate-fade-in">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Peran</label>
                  <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="petugas">Petugas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="disabled">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
            }}>
                    Atur Ulang Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}

        <Card className="card-ocean overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Login Terakhir</th>
                  <th>Dibuat Pada</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (<tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{formatShortId(user.id)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{user.email}</td>
                    <td>
                      <RoleBadge role={user.role}/>
                    </td>
                    <td>
                      <UserStatusChip status={user.status}/>
                    </td>
                    <td className="text-sm text-muted-foreground">{formatDateTime(user.lastLogin)}</td>
                    <td className="text-sm text-muted-foreground">{formatDateTime(user.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4"/>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(user)}>
                              <Edit className="w-4 h-4"/>
                              Ubah Pengguna
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Key className="w-4 h-4"/>
                              Atur Ulang Sandi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'active' ? (<DropdownMenuItem className="gap-2 cursor-pointer text-status-rejected">
                                <UserX className="w-4 h-4"/>
                                Nonaktifkan Pengguna
                              </DropdownMenuItem>) : (<DropdownMenuItem className="gap-2 cursor-pointer text-status-approved">
                                <UserCheck className="w-4 h-4"/>
                                Aktifkan Pengguna
                              </DropdownMenuItem>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="card-ocean">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Hak Akses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                <col className="w-[40%]"/>
                  <col className="w-[30%]"/>
                  <col className="w-[30%]"/>
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Izin</th>
                    <th className="text-center py-2 font-medium">Admin</th>
                    <th className="text-center py-2 font-medium">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {permissions.map((row, index) => (<tr key={row.perm}>
                      <td className="py-2 text-muted-foreground">{row.perm}</td>
                      <td className="text-center py-2">
                        <div className="flex justify-center">
                          <Checkbox checked={row.admin} onCheckedChange={(checked) => handlePermissionToggle(index, 'admin', checked)} aria-label={`Izin ${row.perm} untuk Admin`}/>
                        </div>
                      </td>
                      <td className="text-center py-2">
                        <div className="flex justify-center">
                          <Checkbox checked={row.petugas} onCheckedChange={(checked) => handlePermissionToggle(index, 'petugas', checked)} aria-label={`Izin ${row.perm} untuk Petugas`}/>
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>Tambahkan admin baru ke sistem</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input placeholder="Budi Santoso"/>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="budi@rajaampat.go.id"/>
            </div>
            <div className="space-y-2">
              <Label>Peran</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peran"/>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="petugas">Petugas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button className="btn-ocean gap-2">
              <Mail className="w-4 h-4"/>
              Kirim Undangan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Ubah Pengguna</DialogTitle>
            <DialogDescription>Ubah informasi pengguna</DialogDescription>
          </DialogHeader>
          {selectedUser && (<div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input defaultValue={selectedUser.name}/>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={selectedUser.email}/>
              </div>
              <div className="space-y-2">
                <Label>Peran</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="petugas">Petugas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button className="btn-ocean">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>);
};
export default UserManagementPage;
