export function generatePdfFileName(partyName?: string | null): string {
  if (!partyName || partyName.trim() === "") {
    return "Challan.pdf";
  }

  // Trim the string
  let fileName = partyName.trim();

  // Remove invalid filename characters: \ / : * ? " < > |
  fileName = fileName.replace(/[\\/:*?"<>|]/g, "");

  // Replace spaces with hyphens
  fileName = fileName.replace(/\s+/g, "-");

  // Remove duplicate hyphens
  fileName = fileName.replace(/-+/g, "-");

  // Remove leading or trailing hyphens
  fileName = fileName.replace(/^-+|-+$/g, "");

  if (fileName === "") {
    return "Challan.pdf";
  }

  return `${fileName}.pdf`;
}
