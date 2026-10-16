import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ═══════════════════════════════════════════════
   EXCEL EXPORT
═══════════════════════════════════════════════ */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  sheetName = "Sheet1"
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? "").length)) + 2,
  }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/* ═══════════════════════════════════════════════
   PDF EXPORT
═══════════════════════════════════════════════ */
export function exportToPDF(
  columns: string[],
  rows: (string | number)[][],
  title: string,
  filename: string
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(7, 8, 16);
  doc.rect(0, 0, 297, 297, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TRADIFIVE", 14, 16);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(title, 14, 24);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [columns],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [20, 22, 35],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fillColor: [12, 13, 24],
      textColor: [200, 200, 200],
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [16, 18, 30],
    },
    styles: {
      lineColor: [40, 42, 60],
      lineWidth: 0.3,
    },
  });

  doc.save(`${filename}.pdf`);
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
export function formatDateForExport(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
