import * as XLSX from 'xlsx';

/**
 * Ekspor katalog menu & produk POSAN ke format Excel (.xlsx / .xls)
 * @param {Array} products - Daftar item produk
 * @param {Object} options - Opsi filter dan info tambahan
 */
export function exportProductsToExcel(products = [], options = {}) {
  const wb = XLSX.utils.book_new();

  const generatedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const totalActive = products.filter((p) => p.status === 'Aktif').length;
  const totalInactive = products.filter((p) => p.status === 'Nonaktif').length;
  const totalBarista = products.filter((p) => p.station === 'barista' || !p.station).length;
  const totalKitchen = products.filter((p) => p.station === 'kitchen').length;

  const sheetData = [
    ['POSAN CAFÉ - KATALOG MENU & PRODUK'],
    ['Sistem Operasional Backoffice POSAN Café & Resto'],
    [''],
    ['INFORMASI DOKUMEN KATALOG'],
    ['Waktu Ekspor', generatedAt],
    ['Total Menu', `${products.length} Menu`],
    ['Menu Aktif', `${totalActive} Menu`],
    ['Menu Nonaktif', `${totalInactive} Menu`],
    ['Stasiun Barista (Minuman)', `${totalBarista} Menu`],
    ['Stasiun Kitchen (Makanan)', `${totalKitchen} Menu`],
    ['Filter Kategori', options.category || 'Semua Kategori'],
    ['Filter Status', options.status || 'Semua Status'],
    [''],
    [
      'No',
      'ID Produk',
      'Nama Menu / Produk',
      'Kategori',
      'Stasiun Operasional',
      'Harga Jual (Rp)',
      'Status Menu',
      'Link / URL Foto',
      'Tanggal Input / Update'
    ],
    ...products.map((p, idx) => [
      idx + 1,
      `PRD-${String(p.id || idx + 1).padStart(3, '0')}`,
      p.name || '-',
      p.category || 'Tanpa Kategori',
      p.station === 'kitchen' ? 'Kitchen (Dapur)' : 'Barista (Minuman)',
      Number(p.price || 0),
      p.status || 'Aktif',
      p.imageUrl && !p.imageUrl.startsWith('data:image') ? p.imageUrl : '(Tersimpan Lokal)',
      p.updatedAt || '-'
    ]),
    [''],
    [
      'TOTAL REKAPITULASI',
      '',
      `${products.length} Menu Terdaftar`,
      '',
      '',
      products.reduce((acc, p) => acc + (Number(p.price) || 0), 0),
      `${totalActive} Aktif / ${totalInactive} Nonaktif`,
      '',
      ''
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for optimal viewing in Microsoft Excel / LibreOffice
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // ID Produk
    { wch: 32 }, // Nama Menu
    { wch: 20 }, // Kategori
    { wch: 22 }, // Stasiun Operasional
    { wch: 18 }, // Harga Jual
    { wch: 16 }, // Status
    { wch: 45 }, // Link Foto
    { wch: 24 }  // Tanggal Update
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Katalog Produk POSAN');

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Katalog_Produk_POSAN_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Buat dan unduh template file Excel untuk import produk massal
 */
export function downloadProductImportTemplate() {
  const wb = XLSX.utils.book_new();

  const templateRows = [
    ['PANDUAN PENGISIAN TEMPLATE IMPORT PRODUK POSAN:'],
    ['1. Kolom "Nama Menu" dan "Harga Jual" wajib diisi.'],
    ['2. Kolom "Kategori" diisi nama kategori (misal: Coffee, Non-Coffee, Food, Pastry).'],
    ['3. Kolom "Stasiun Operasional" diisi "barista" (untuk minuman) atau "kitchen" (untuk makanan).'],
    ['4. Kolom "Status" diisi "Aktif" atau "Nonaktif".'],
    ['5. Kolom "URL Foto" bersifat opsional (bisa diisi link gambar langsung atau dikosongkan).'],
    [''],
    [
      'Nama Menu',
      'Kategori',
      'Stasiun Operasional',
      'Harga Jual',
      'Status',
      'URL Foto',
      'Deskripsi'
    ],
    [
      'Kopi Susu Gula Aren',
      'Coffee',
      'barista',
      22000,
      'Aktif',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500',
      'Espresso blend dengan susu segar dan gula aren murni'
    ],
    [
      'Matcha Latte Artisan',
      'Non-Coffee',
      'barista',
      28000,
      'Aktif',
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500',
      'Uji matcha murni dengan steamed fresh milk'
    ],
    [
      'Butter Croissant',
      'Pastry',
      'kitchen',
      25000,
      'Aktif',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
      'French flaky butter croissant hangat'
    ],
    [
      'Spaghetti Aglio Olio',
      'Food',
      'kitchen',
      38000,
      'Aktif',
      '',
      'Pasta dengan olive oil, bawang putih, dan chili flakes'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateRows);

  ws['!cols'] = [
    { wch: 30 }, // Nama Menu
    { wch: 18 }, // Kategori
    { wch: 22 }, // Stasiun
    { wch: 16 }, // Harga Jual
    { wch: 14 }, // Status
    { wch: 45 }, // URL Foto
    { wch: 40 }  // Deskripsi
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template Import Produk');
  XLSX.writeFile(wb, 'Template_Import_Produk_POSAN.xlsx');
}

/**
 * Parsing file Excel (.xlsx / .xls) atau .csv menjadi array produk
 * @param {File} file
 * @returns {Promise<Array>}
 */
export function parseProductImportFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('File tidak ditemukan.'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi sheet ke array of objects
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel kosong.');
        }

        // Cari baris header (baris yang memiliki kolom 'Nama' atau 'Name')
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
          const rowStr = rawRows[i].map((cell) => String(cell).toLowerCase().trim()).join(' ');
          if (rowStr.includes('nama') || rowStr.includes('name') || rowStr.includes('produk') || rowStr.includes('menu')) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          // Default ke baris 0 jika tidak ketemu penanda
          headerRowIndex = 0;
        }

        const headers = rawRows[headerRowIndex].map((h) => String(h).trim().toLowerCase());
        const dataRows = rawRows.slice(headerRowIndex + 1);

        // Helper cari index kolom
        const findColIndex = (...keywords) => {
          return headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));
        };

        const idxName = findColIndex('nama menu', 'nama produk', 'nama', 'name', 'menu');
        const idxCategory = findColIndex('kategori', 'category', 'kat');
        const idxStation = findColIndex('stasiun', 'station', 'pos');
        const idxPrice = findColIndex('harga jual', 'harga', 'price', 'rp');
        const idxStatus = findColIndex('status');
        const idxImageUrl = findColIndex('url foto', 'foto', 'image', 'gambar', 'link');
        const idxDescription = findColIndex('deskripsi', 'description', 'desc', 'keterangan');

        const parsedProducts = [];

        dataRows.forEach((row, rIdx) => {
          if (!row || row.every((c) => String(c).trim() === '')) return; // Lewati baris kosong

          const rawName = idxName !== -1 ? String(row[idxName] || '').trim() : '';
          if (!rawName || rawName.toLowerCase().startsWith('total')) return; // Lewati baris total atau tanpa nama

          // Parsing harga
          let rawPrice = idxPrice !== -1 ? row[idxPrice] : 0;
          let numericPrice = 0;
          if (typeof rawPrice === 'number') {
            numericPrice = rawPrice;
          } else if (typeof rawPrice === 'string') {
            // Hapus Rp, titik, spasi
            const cleanStr = rawPrice.replace(/[^0-9]/g, '');
            numericPrice = Number(cleanStr) || 0;
          }

          // Parsing kategori
          const rawCat = idxCategory !== -1 ? String(row[idxCategory] || '').trim() : 'Coffee & Beverages';
          const category = rawCat || 'Coffee & Beverages';

          // Parsing station
          let station = 'barista';
          if (idxStation !== -1) {
            const st = String(row[idxStation] || '').toLowerCase().trim();
            if (st.includes('kitchen') || st.includes('dapur') || st.includes('makan') || st.includes('food')) {
              station = 'kitchen';
            }
          } else if (category.toLowerCase().includes('food') || category.toLowerCase().includes('makan') || category.toLowerCase().includes('pastry')) {
            station = 'kitchen';
          }

          // Parsing status
          let status = 'Aktif';
          if (idxStatus !== -1) {
            const stStr = String(row[idxStatus] || '').toLowerCase().trim();
            if (stStr.includes('nonaktif') || stStr.includes('inactive') || stStr === 'false' || stStr === '0') {
              status = 'Nonaktif';
            }
          }

          // Parsing image url
          const imageUrl = idxImageUrl !== -1 ? String(row[idxImageUrl] || '').trim() : '';
          const description = idxDescription !== -1 ? String(row[idxDescription] || '').trim() : '';

          parsedProducts.push({
            rowNumber: headerRowIndex + 2 + rIdx,
            name: rawName,
            category: category,
            station: station,
            price: numericPrice,
            status: status,
            imageUrl: imageUrl.startsWith('http') ? imageUrl : '',
            description: description,
            isValid: Boolean(rawName && numericPrice >= 0),
          });
        });

        resolve(parsedProducts);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsArrayBuffer(file);
  });
}
