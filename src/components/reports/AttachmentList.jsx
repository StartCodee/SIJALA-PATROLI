import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { isWebImageUrl, normalizeAttachmentUrl } from '@/lib/patrolFindingUtils';

export const AttachmentList = ({ items = [], emptyLabel = 'Tidak ada lampiran.' }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const url = String(item || '').trim();
        if (!url) return null;
        const previewUrl = normalizeAttachmentUrl(url);

        const canPreview = isWebImageUrl(previewUrl);

        return (
          <div key={`${url}-${index}`} className="rounded-lg border border-border p-3">
            <p className="mb-2 break-all font-mono text-xs text-muted-foreground">{url}</p>

            {canPreview ? (
              <div className="space-y-2">
                <div className="h-44 w-full overflow-hidden rounded-md border border-border bg-slate-50">
                  <img
                    src={previewUrl}
                    alt={`Lampiran ${index + 1}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-primary hover:underline"
                >
                  Buka gambar
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <ImageIcon className="mr-2 h-3.5 w-3.5" />
                File tersimpan dari perangkat mobile (path lokal)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
