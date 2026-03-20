function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeCell(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r?\n|\r/g, " ").trim();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function buildTableHtml(title, columns, rows) {
  const headCells = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");

  const bodyRows = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${escapeHtml(sanitizeCell(row[column.key]))}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
      h1 { margin: 0 0 16px; font-size: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; vertical-align: top; }
      th { background: #e2e8f0; font-weight: 700; }
      tr:nth-child(even) td { background: #f8fafc; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <table>
      <thead>
        <tr>${headCells}</tr>
      </thead>
      <tbody>
        ${bodyRows || `<tr><td colspan="${columns.length}">Tidak ada data</td></tr>`}
      </tbody>
    </table>
  </body>
</html>`;
}

export function exportRowsToExcel({ fileName, title, columns, rows }) {
  const tableHtml = buildTableHtml(title, columns, rows);
  const blob = new Blob([`\ufeff${tableHtml}`], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  downloadBlob(blob, fileName.endsWith(".xls") ? fileName : `${fileName}.xls`);
}

export function exportRowsToPdf({ title, columns, rows }) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
  if (!printWindow) return;

  const tableHtml = buildTableHtml(title, columns, rows);
  printWindow.document.open();
  printWindow.document.write(tableHtml);
  printWindow.document.close();
  printWindow.focus();

  const handlePrint = () => {
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    handlePrint();
  } else {
    printWindow.onload = handlePrint;
  }
}

export function buildExportFileName(prefix, dateFrom, dateTo) {
  const safePrefix = String(prefix || "dashboard")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safePrefix}-${dateFrom || "all"}_${dateTo || "all"}`;
}
