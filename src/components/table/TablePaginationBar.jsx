import { Button } from '@/components/ui/button';

export const TablePaginationBar = ({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const safeTotal = Math.max(0, Number(totalItems) || 0);
  const safePageSize = Math.max(1, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);

  const from = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const to = safeTotal === 0 ? 0 : Math.min(safeTotal, safePage * safePageSize);

  return (
    <div className={`mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-xs text-muted-foreground">
        Menampilkan <span className="font-semibold text-foreground">{from}</span>-
        <span className="font-semibold text-foreground">{to}</span> dari{' '}
        <span className="font-semibold text-foreground">{safeTotal}</span> data
      </p>

      <div className="flex items-center gap-2">
        <select
          value={String(safePageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          aria-label="Jumlah data per halaman"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}/halaman
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
          Sebelumnya
        </Button>
        <span className="min-w-[92px] text-center text-xs text-muted-foreground">
          Halaman {safePage} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
};
