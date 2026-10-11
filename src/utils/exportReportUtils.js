import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format currency to IDR string
 */
export const formatCurrency = (val) => {
  return `Rp${Number(val || 0).toLocaleString('id-ID')}`;
};

/**
 * 1. EXPORT TO EXCEL (.xlsx)
 * Menghasilkan file Excel terstruktur rapi dengan lembar kerja ringkasan dan rincian transaksi harian.
 */
export function exportReportToExcel(reportData, filterState = {}) {
  const wb = XLSX.utils.book_new();

  const periodText = filterState.dateRangeText || reportData.dateRangeText || 'September 2026';
  const cashierText = filterState.cashierName || 'Semua Kasir';
  const methodText = filterState.paymentMethodName || 'Semua Metode';
  const generatedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // --- SHEET 1: RINGKASAN EKSEKUTIF ---
  const summarySheetData = [
    ['POSAN CAFÉ - SENOPATI BRANCH'],
    ['LAPORAN PENJUALAN & ANALISIS BISNIS'],
    [''],
    ['PARAMETER FILTER LAPORAN'],
    ['Periode Laporan', periodText],
    ['Filter Kasir', cashierText],
    ['Filter Metode Pembayaran', methodText],
    ['Waktu Unduh', generatedAt],
    ['Status Data', 'Tersinkronisasi Real-time dengan Cloud POS'],
    [''],
    ['RINGKASAN METRIK UTAMA (KPI)'],
    ['Metrik', 'Nilai', 'Perubahan Periode Sebelumnya'],
    ['Total Transaksi', reportData.kpi.totalTransactions.formattedValue, reportData.kpi.totalTransactions.changeText],
    ['Total Penjualan', reportData.kpi.totalSales.formattedValue, reportData.kpi.totalSales.changeText],
    ['Produk Terjual', `${reportData.kpi.productsSold.formattedValue} item`, reportData.kpi.productsSold.changeText],
    ['Rata-Rata Transaksi', reportData.kpi.averageTransaction.formattedValue, reportData.kpi.averageTransaction.changeText],
    [''],
    ['DISTRIBUSI METODE PEMBAYARAN'],
    ['Metode Pembayaran', 'Porsi (%)', 'Total Nominal', 'Estimasi Pesanan'],
    ...reportData.paymentMethods.methods.map((m) => [
      m.name,
      `${m.percentage}%`,
      m.formattedNominal,
      `${m.orderCount} transaksi`
    ]),
    [''],
    ['PRODUK TERLARIS (TOP 5 MENU)'],
    ['Peringkat', 'Nama Menu', 'Jumlah Terjual (Item)', 'Total Omzet (Rp)'],
    ...reportData.topProducts.map((p) => [
      `#${p.rank}`,
      p.name,
      `${p.soldCount} item`,
      p.formattedSales
    ])
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);

  // Set column widths for Sheet 1
  wsSummary['!cols'] = [
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Laporan');

  // --- SHEET 2: RINCIAN TRANSAKSI HARIAN ---
  const dailySheetData = [
    ['POSAN CAFÉ - RINCIAN PERFORMA TRANSAKSI HARIAN'],
    [`Periode: ${periodText}`],
    [''],
    ['Tanggal', 'Jumlah Transaksi', 'Total Penjualan (Rp)', 'Rata-Rata Transaksi (Rp)', 'Status Operasional'],
    ...reportData.dailyTransactionsTable.map((row) => [
      row.date,
      row.transactionCount,
      row.totalSales,
      row.avgTransaction,
      row.status
    ]),
    [''],
    [
      'TOTAL / RATA-RATA',
      reportData.dailyTransactionsTable.reduce((acc, r) => acc + r.transactionCount, 0),
      reportData.dailyTransactionsTable.reduce((acc, r) => acc + r.totalSales, 0),
      Math.round(
        reportData.dailyTransactionsTable.reduce((acc, r) => acc + r.totalSales, 0) /
        (reportData.dailyTransactionsTable.reduce((acc, r) => acc + r.transactionCount, 0) || 1)
      ),
      'Selesai'
    ]
  ];

  const wsDaily = XLSX.utils.aoa_to_sheet(dailySheetData);

  // Set column widths for Sheet 2
  wsDaily['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsDaily, 'Rincian Transaksi Harian');

  // --- SHEET 3: LAPORAN PENJUALAN PER PRODUK ---
  const productRows = (reportData.productReportsTable || []).map((p) => [
    p.name,
    p.category || 'Menu Kafe',
    `${p.percentage}%`,
    `${p.salesCount} item`,
    p.totalSales,
    p.unitPrice
  ]);

  const productSheetData = [
    ['POSAN CAFÉ - LAPORAN PENJUALAN PER PRODUK'],
    [`Periode: ${periodText}`],
    [''],
    ['Nama Produk', 'Kategori', 'Penjualan (%)', 'Jumlah Penjualan', 'Nominal Penjualan (Rp)', 'Harga Satuan (Rp)'],
    ...productRows,
    [''],
    [
      'TOTAL PENJUALAN PRODUK',
      '',
      '100%',
      `${(reportData.productReportsTable || []).reduce((acc, p) => acc + (p.salesCount || 0), 0)} item`,
      (reportData.productReportsTable || []).reduce((acc, p) => acc + (p.totalSales || 0), 0),
      ''
    ]
  ];

  const wsProduct = XLSX.utils.aoa_to_sheet(productSheetData);
  wsProduct['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, wsProduct, 'Laporan Produk');

  // Generate clean filename
  const cleanPeriod = periodText.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  const fileName = `Laporan_Penjualan_POSAN_${cleanPeriod}_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * 2. EXPORT TO PDF (.pdf)
 * Menghasilkan dokumen PDF profesional POSAN Café lengkap dengan ringkasan dan tabel transaksi.
 */
export function exportReportToPDF(reportData, filterState = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const periodText = filterState.dateRangeText || reportData.dateRangeText || 'September 2026';
  const cashierText = filterState.cashierName || 'Semua Kasir';
  const methodText = filterState.paymentMethodName || 'Semua Metode';
  const generatedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Brand Header Color Bar
  doc.setFillColor(34, 28, 24); // #221C18 (POSAN Brand Dark)
  doc.rect(0, 0, 210, 26, 'F');

  // Brand Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POSAN CAFÉ', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(230, 220, 210);
  doc.text('Kopi Kenangan Senopati Branch • Backoffice Backlog System', 14, 18);

  doc.setFontSize(8);
  doc.text(`Waktu Cetak: ${generatedAt} WIB`, 196, 18, { align: 'right' });

  // Document Title
  doc.setTextColor(30, 23, 19);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Penjualan POSAN', 14, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(116, 107, 99);
  doc.text('Analisis penjualan, omzet harian, performa produk, dan distribusi pembayaran.', 14, 42);

  // Metadata Card / Box
  doc.setFillColor(248, 245, 240); // #F8F5F0
  doc.roundedRect(14, 46, 182, 16, 2, 2, 'F');

  doc.setFontSize(8.5);
  doc.setTextColor(140, 94, 60); // #8C5E3C
  doc.setFont('helvetica', 'bold');
  doc.text('PERIODE:', 18, 53);
  doc.setTextColor(30, 23, 19);
  doc.setFont('helvetica', 'normal');
  doc.text(periodText, 34, 53);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 94, 60);
  doc.text('KASIR:', 98, 53);
  doc.setTextColor(30, 23, 19);
  doc.setFont('helvetica', 'normal');
  doc.text(cashierText, 110, 53);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 94, 60);
  doc.text('METODE:', 148, 53);
  doc.setTextColor(30, 23, 19);
  doc.setFont('helvetica', 'normal');
  doc.text(methodText, 163, 53);

  // 1. KPI Cards Row (4 Columns in PDF)
  const kpis = [
    { label: 'TOTAL TRANSAKSI', val: reportData.kpi.totalTransactions.formattedValue, change: reportData.kpi.totalTransactions.changeText },
    { label: 'TOTAL PENJUALAN', val: reportData.kpi.totalSales.formattedValue, change: reportData.kpi.totalSales.changeText },
    { label: 'PRODUK TERJUAL', val: `${reportData.kpi.productsSold.formattedValue} item`, change: reportData.kpi.productsSold.changeText },
    { label: 'RATA-RATA TRANSAKSI', val: reportData.kpi.averageTransaction.formattedValue, change: reportData.kpi.averageTransaction.changeText }
  ];

  const cardWidth = 43;
  const cardGap = 3.3;
  const startX = 14;
  const cardY = 66;

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (cardWidth + cardGap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 219, 208);
    doc.roundedRect(x, cardY, cardWidth, 22, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(116, 107, 99);
    doc.text(kpi.label, x + 3, cardY + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(30, 23, 19);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.val, x + 3, cardY + 13);

    doc.setFontSize(7);
    doc.setTextColor(21, 128, 61); // Green
    doc.setFont('helvetica', 'bold');
    doc.text(`${kpi.change} vs periode lalu`, x + 3, cardY + 18.5);
  });

  // 2. Section: Metode Pembayaran & Produk Terlaris (2 side-by-side tables)
  let currentY = 94;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 23, 19);
  doc.text('Metode Pembayaran', 14, currentY);
  doc.text('Produk Terlaris (Top 5 Menu)', 110, currentY);

  // Table: Metode Pembayaran
  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 14, right: 106 },
    head: [['Metode', 'Porsi', 'Total Omzet']],
    body: reportData.paymentMethods.methods.map((m) => [
      m.name,
      `${m.percentage}%`,
      m.formattedNominal
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [34, 28, 24],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 23, 19]
    },
    alternateRowStyles: {
      fillColor: [251, 249, 246]
    }
  });

  // Table: Produk Terlaris
  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 110, right: 14 },
    head: [['Rank', 'Nama Menu', 'Terjual', 'Omzet']],
    body: reportData.topProducts.map((p) => [
      `#${p.rank}`,
      p.name,
      `${p.soldCount} item`,
      p.formattedSales
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [140, 94, 60],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 23, 19]
    },
    alternateRowStyles: {
      fillColor: [251, 249, 246]
    }
  });

  // 3. Section: Laporan Penjualan Per Produk
  const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 130) + 8;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 23, 19);
  doc.text('Laporan Penjualan Per Produk', 14, finalY);

  if (reportData.productReportsTable && reportData.productReportsTable.length > 0) {
    autoTable(doc, {
      startY: finalY + 3,
      margin: { left: 14, right: 14 },
      head: [['Nama Produk', 'Kategori', 'Penjualan', 'Jumlah Penjualan', 'Nominal Penjualan', 'Harga Satuan']],
      body: reportData.productReportsTable.map((p) => [
        p.name,
        p.category || 'Menu Kafe',
        `${p.percentage}% (${p.salesStatus})`,
        `${p.salesCount} item`,
        p.formattedTotalSales,
        p.formattedUnitPrice
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [140, 94, 60],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [30, 23, 19]
      },
      alternateRowStyles: {
        fillColor: [251, 249, 246]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { fontStyle: 'bold', halign: 'right' },
        4: { textColor: [140, 94, 60], fontStyle: 'bold', halign: 'right' },
        5: { halign: 'right' }
      }
    });
  }

  // 4. Section: Rincian Transaksi Harian
  const dailyY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : finalY + 40) + 8;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 23, 19);
  doc.text('Rincian Transaksi Harian', 14, dailyY);

  autoTable(doc, {
    startY: dailyY + 3,
    margin: { left: 14, right: 14 },
    head: [['Tanggal', 'Jumlah Transaksi', 'Total Penjualan', 'Rata-Rata Transaksi', 'Status']],
    body: reportData.dailyTransactionsTable.map((row) => [
      row.date,
      `${row.transactions || row.transactionCount || 0} Transaksi`,
      row.formattedTotalSales,
      row.formattedAvgTransaction,
      row.status
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [34, 28, 24],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 23, 19]
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { fontStyle: 'bold', halign: 'right' },
      3: { textColor: [140, 94, 60], fontStyle: 'bold', halign: 'right' },
      4: { textColor: [21, 128, 61], fontStyle: 'bold' }
    }
  });

  // Footer on page
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(7.5);
  doc.setTextColor(158, 149, 141);
  doc.text('POSAN Cafe Backoffice - Dokumen ini dibuat otomatis oleh sistem.', 14, pageHeight - 8);
  doc.text(`Dicetak Real-time dari database`, 196, pageHeight - 8, { align: 'right' });

  // Generate clean filename
  const cleanPeriod = periodText.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  const fileName = `Laporan_Penjualan_POSAN_${cleanPeriod}_${Date.now()}.pdf`;

  doc.save(fileName);
}

/**
 * 3. EXPORT TO CSV (.csv)
 */
export function exportReportToCSV(reportData, filterState = {}) {
  const periodText = filterState.dateRangeText || reportData.dateRangeText || 'September 2026';
  
  const productHeader = 'Nama Produk,Kategori,Penjualan (%),Jumlah Penjualan,Nominal Penjualan,Harga Satuan\n';
  const productRows = (reportData.productReportsTable || [])
    .map((p) => `"${p.name}","${p.category || 'Menu'}","${p.percentage}%","${p.salesCount} item","${p.totalSales}","${p.unitPrice}"`)
    .join('\n');

  const trxHeader = '\n\nTanggal,Jumlah Transaksi,Total Penjualan,Rata-Rata Transaksi,Status\n';
  const trxRows = (reportData.dailyTransactionsTable || [])
    .map((row) => `"${row.date}","${row.transactions || row.transactionCount || 0} Transaksi","${row.totalSales}","${row.avgTransaction}","${row.status}"`)
    .join('\n');

  const blob = new Blob([`# POSAN CAFE - LAPORAN PENJUALAN PRODUK & TRANSAKSI (${periodText})\n${productHeader}${productRows}${trxHeader}${trxRows}`], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `laporan_penjualan_posan_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 4. EXPORT STAFF REPORT TO EXCEL (.xlsx)
 */
export function exportStaffReportToExcel(staffReportData, filterState = {}) {
  const wb = XLSX.utils.book_new();

  const periodText = filterState.dateRangeText || staffReportData.periodLabel || 'Seminggu (7 Hari)';
  const staffText = filterState.staffName || 'Semua Staf';
  const roleText = filterState.roleName || 'Semua Peran';
  const generatedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // --- SHEET 1: RINGKASAN KINERJA STAF ---
  const summarySheetData = [
    ['POSAN CAFÉ - LAPORAN KINERJA & PRODUKTIVITAS STAF'],
    [`Periode: ${periodText}`],
    [''],
    ['PARAMETER FILTER'],
    ['Periode', periodText],
    ['Filter Staf', staffText],
    ['Filter Peran', roleText],
    ['Waktu Unduh', generatedAt],
    [''],
    ['RINGKASAN METRIK KINERJA (KPI)'],
    ['Metrik', 'Nilai', 'Keterangan'],
    ['Total Staf Bertugas', staffReportData.kpi?.totalActiveStaff?.formattedValue || '0', 'Staf Aktif'],
    ['Total Pesanan Selesai', staffReportData.kpi?.totalCompletedOrders?.formattedValue || '0', 'Selesai Dikerjakan'],
    ['Pesanan Masih Diproses', staffReportData.kpi?.totalProcessingOrders?.formattedValue || '0', 'Dalam Antrean / Proses'],
    ['Rata-Rata Waktu Penyelesaian', staffReportData.kpi?.averageCompletionTime?.formattedValue || '0s', 'Kecepatan Rata-Rata'],
    ['Staf Paling Produktif', staffReportData.kpi?.topPerformer?.formattedValue || '-', 'Performa Tertinggi'],
    [''],
    ['TABEL KINERJA STAF PER HARI/TANGGAL'],
    ['Hari / Tanggal', 'Nama Staf', 'Peran / Stasiun', 'Pesanan Selesai', 'Sedang Diproses', 'Rata-Rata Waktu', 'Rating Efisiensi'],
    ...(staffReportData.staffPerformanceTable || []).map((row) => [
      row.formattedDate || row.dateKey,
      row.staffName,
      row.roleBadgeLabel || row.staffRole,
      row.completedCount,
      row.processingCount,
      row.formattedAvgDuration,
      row.efficiencyRating
    ])
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  wsSummary['!cols'] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Kinerja Staf');

  // --- SHEET 2: DETAIL ORDER ITEM PER STAF ---
  const allDetailsRows = [];
  (staffReportData.staffPerformanceTable || []).forEach((row) => {
    (row.detail || []).forEach((det) => {
      allDetailsRows.push([
        row.formattedDate || row.dateKey,
        row.staffName,
        det.receiptNumber,
        det.customerName || 'Pelanggan',
        det.productName,
        det.quantity,
        det.stationLabel || det.station,
        det.orderTime || '-',
        det.processingTime || '-',
        det.completedTime || '-',
        det.formattedDuration || '-',
        det.statusLabel || det.status,
        det.notes || '-'
      ]);
    });
  });

  if (allDetailsRows.length > 0) {
    const detailSheetData = [
      ['POSAN CAFÉ - DETAIL PENGERJAAN PESANAN STAF'],
      [`Periode: ${periodText}`],
      [''],
      ['Hari/Tanggal', 'Nama Staf', 'No. Struk', 'Pelanggan', 'Menu / Produk', 'Qty', 'Stasiun', 'Waktu Masuk', 'Waktu Proses', 'Waktu Selesai', 'Durasi Penyelesaian', 'Status', 'Catatan'],
      ...allDetailsRows
    ];
    const wsDetail = XLSX.utils.aoa_to_sheet(detailSheetData);
    wsDetail['!cols'] = [
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
      { wch: 20 },
      { wch: 25 },
      { wch: 8 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Pengerjaan');
  }

  const cleanPeriod = periodText.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  XLSX.writeFile(wb, `Laporan_Kinerja_Staf_POSAN_${cleanPeriod}_${Date.now()}.xlsx`);
}

/**
 * 5. EXPORT STAFF REPORT TO PDF (.pdf)
 */
export function exportStaffReportToPDF(staffReportData, filterState = {}) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const periodText = filterState.dateRangeText || staffReportData.periodLabel || 'Seminggu (7 Hari)';
  const staffText = filterState.staffName || 'Semua Staf';
  const roleText = filterState.roleName || 'Semua Peran';
  const generatedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // Header POSAN Brand
  doc.setFillColor(34, 28, 24);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('POSAN CAFÉ - LAPORAN KINERJA STAF', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(218, 205, 192);
  doc.text(`Periode: ${periodText} | Filter: ${staffText} (${roleText}) | Unduh: ${generatedAt}`, 14, 21);

  // KPI Metric Boxes
  const kpiItems = [
    { label: 'STAF BERTUGAS', val: staffReportData.kpi?.totalActiveStaff?.formattedValue || '0' },
    { label: 'PESANAN SELESAI', val: staffReportData.kpi?.totalCompletedOrders?.formattedValue || '0' },
    { label: 'SEDANG DIPROSES', val: staffReportData.kpi?.totalProcessingOrders?.formattedValue || '0' },
    { label: 'RATA-RATA WAKTU', val: staffReportData.kpi?.averageCompletionTime?.formattedValue || '0s' },
  ];

  kpiItems.forEach((k, idx) => {
    const x = 14 + idx * 46;
    doc.setFillColor(248, 245, 240);
    doc.roundedRect(x, 34, 43, 20, 2, 2, 'F');

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 94, 60);
    doc.text(k.label, x + 4, 40);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 28, 24);
    doc.text(k.val, x + 4, 49);
  });

  // Table
  const tableBody = (staffReportData.staffPerformanceTable || []).map((r) => [
    r.formattedDate || r.dateKey,
    r.staffName,
    r.roleBadgeLabel || r.staffRole,
    `${r.completedCount} selesai`,
    `${r.processingCount} proses`,
    r.formattedAvgDuration,
    r.efficiencyRating
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Hari / Tanggal', 'Nama Staf', 'Peran', 'Pesanan Selesai', 'Masih Diproses', 'Rata-Rata Waktu', 'Rating']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 28, 24],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 23, 19]
    },
    alternateRowStyles: {
      fillColor: [250, 247, 242]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      3: { textColor: [21, 128, 61], fontStyle: 'bold' },
      4: { textColor: [180, 83, 9], fontStyle: 'bold' },
      5: { textColor: [140, 94, 60], fontStyle: 'bold' },
    }
  });

  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(7.5);
  doc.setTextColor(158, 149, 141);
  doc.text('POSAN Cafe Backoffice - Dokumen Laporan Kinerja Staf Real-time.', 14, pageHeight - 8);
  doc.text(`Tersinkronisasi Database realtime`, 196, pageHeight - 8, { align: 'right' });

  const cleanPeriod = periodText.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  doc.save(`Laporan_Kinerja_Staf_POSAN_${cleanPeriod}_${Date.now()}.pdf`);
}

/**
 * 6. EXPORT STAFF REPORT TO CSV (.csv)
 */
export function exportStaffReportToCSV(staffReportData, filterState = {}) {
  const periodText = filterState.dateRangeText || staffReportData.periodLabel || 'Seminggu (7 Hari)';

  const headers = 'Hari/Tanggal,Nama Staf,Peran/Stasiun,Pesanan Selesai,Sedang Diproses,Rata-Rata Waktu Penyelesaian,Rating Efisiensi\n';
  const rows = (staffReportData.staffPerformanceTable || [])
    .map((r) => `"${r.formattedDate || r.dateKey}","${r.staffName}","${r.roleBadgeLabel || r.staffRole}","${r.completedCount}","${r.processingCount}","${r.formattedAvgDuration}","${r.efficiencyRating}"`)
    .join('\n');

  const blob = new Blob([`# POSAN CAFE - LAPORAN KINERJA & PRODUKTIVITAS STAF (${periodText})\n${headers}${rows}`], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `laporan_kinerja_staf_posan_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

