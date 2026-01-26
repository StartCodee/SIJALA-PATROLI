export const dummyAdminUsers = [
    {
        id: 'ADM-001',
        name: 'Rudi Hartono',
        email: 'rudi.hartono@rajaampat.go.id',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-19T08:30:00',
        createdAt: '2023-01-01T00:00:00',
    },
    {
        id: 'ADM-002',
        name: 'Dewi Anggraini',
        email: 'dewi.anggraini@rajaampat.go.id',
        role: 'petugas',
        status: 'active',
        lastLogin: '2024-01-19T09:15:00',
        createdAt: '2023-03-15T00:00:00',
    },
    {
        id: 'ADM-003',
        name: 'Bambang Susilo',
        email: 'bambang.susilo@rajaampat.go.id',
        role: 'petugas',
        status: 'active',
        lastLogin: '2024-01-18T16:45:00',
        createdAt: '2023-06-01T00:00:00',
    },
];
export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
export const formatShortId = (id) => {
    if (!id)
        return id;
    const parts = id.split('-');
    if (parts.length < 2)
        return id;
    const prefix = parts[0];
    const suffix = parts[parts.length - 1];
    if (!suffix)
        return id;
    const shortSuffix = suffix.length > 3 ? suffix.slice(-3) : suffix.padStart(3, '0');
    return `${prefix}-${shortSuffix}`;
};
