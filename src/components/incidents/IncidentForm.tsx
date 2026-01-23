import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
import { INCIDENT_CATEGORIES, Incident } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface IncidentFormProps {
  onSuccess?: (incident: Incident) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  resetOnSuccess?: boolean;
  className?: string;
}

const initialFormData = {
  title: '',
  category: '' as Incident['category'] | '',
  description: '',
  vesselId: '',
  patrolId: '',
  lat: '',
  lon: '',
};

export const IncidentForm = ({
  onSuccess,
  onCancel,
  submitLabel = 'Simpan Laporan',
  cancelLabel = 'Batal',
  showCancel = true,
  resetOnSuccess = false,
  className,
}: IncidentFormProps) => {
  const { toast } = useToast();
  const { addIncident, vessels, patrols } = useData();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Judul laporan wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: 'Error',
        description: 'Kategori wajib dipilih',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const newIncident = addIncident({
      title: formData.title.trim(),
      category: formData.category as Incident['category'],
      description: formData.description.trim(),
      status: 'open',
      severity: 'medium',
      time: new Date(),
      vesselId: formData.vesselId || null,
      patrolId: formData.patrolId || null,
      location: formData.lat && formData.lon
        ? { lat: parseFloat(formData.lat), lon: parseFloat(formData.lon) }
        : null,
    });

    toast({
      title: 'Berhasil',
      description: 'Laporan kejadian berhasil dibuat',
    });

    if (resetOnSuccess) {
      setFormData(initialFormData);
    }

    setIsSubmitting(false);
    onSuccess?.(newIncident);
  };

  const activePatrols = patrols.filter(p => p.status === 'active');

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul Laporan *</Label>
        <Input
          id="title"
          placeholder="Contoh: Dugaan penangkapan ikan ilegal"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Kategori *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Incident['category'] }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {INCIDENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan detail kejadian..."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Vessel */}
      <div className="space-y-2">
        <Label htmlFor="vessel">Kapal Terkait</Label>
        <Select
          value={formData.vesselId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, vesselId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kapal (opsional)" />
          </SelectTrigger>
          <SelectContent>
            {vessels.map((vessel) => (
              <SelectItem key={vessel.id} value={vessel.id}>
                {vessel.name} ({vessel.callSign})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Patrol */}
      <div className="space-y-2">
        <Label htmlFor="patrol">Patroli Terkait</Label>
        <Select
          value={formData.patrolId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, patrolId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih patroli (opsional)" />
          </SelectTrigger>
          <SelectContent>
            {activePatrols.map((patrol) => (
              <SelectItem key={patrol.id} value={patrol.id}>
                {patrol.code} - {patrol.areaName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Koordinat Lokasi (Opsional)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Latitude (cth: -0.234)"
              value={formData.lat}
              onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
            />
          </div>
          <div>
            <Input
              placeholder="Longitude (cth: 130.512)"
              value={formData.lon}
              onChange={(e) => setFormData(prev => ({ ...prev, lon: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
};
