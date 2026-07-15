function escapeCsvCell(value: unknown): string {
  const raw = value == null ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function rowsToCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** UTF-8 BOM helps Excel open CSV with Indian currency correctly. */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<unknown>>) {
  const csv = `\uFEFF${rowsToCsv(headers, rows)}`;
  downloadTextFile(filename, csv, 'text/csv;charset=utf-8;');
}

/** Excel-friendly CSV saved as .xls — opens directly in Excel without extra deps. */
export function downloadExcel(filename: string, headers: string[], rows: Array<Array<unknown>>) {
  const csv = `\uFEFF${rowsToCsv(headers, rows)}`;
  downloadTextFile(
    filename.endsWith('.xls') ? filename : `${filename}.xls`,
    csv,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

export function downloadBlobFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
