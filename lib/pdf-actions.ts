/** Generate a PDF blob and trigger download / share / preview. */

export async function downloadPdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function previewPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  // Revoke later so the new tab can load the blob
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function sharePdfBlob(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: 'application/pdf' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title, text: title });
    return true;
  }
  await downloadPdfBlob(blob, filename);
  return false;
}
