import { apiRequest } from './apiClient';

const STORAGE_KEYS = {
  INGREDIENTS: 'posan_inventory_ingredients_v1',
  RECIPES: 'posan_inventory_recipes_v1',
  OPNAME_SESSIONS: 'posan_inventory_opnames_v1',
  MUTATIONS: 'posan_inventory_mutations_v1',
};

// Initial Realistic Café Raw Materials
export const DEFAULT_INGREDIENTS = [
  {
    id: 'ing-1',
    sku: 'BHK-KOP-01',
    name: 'Biji Kopi Arabika House Blend',
    category: 'Biji Kopi & Espresso',
    unit: 'gram',
    currentStock: 3500,
    minimumStock: 1000,
    costPerUnit: 280, // Rp 280 / gram (Rp 280.000 / kg)
    supplier: 'Roastery Nusantara',
    description: 'Campuran Arabika Gayo & Mandheling medium-dark roast',
    status: 'Aman',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-2',
    sku: 'BHK-MILK-01',
    name: 'Susu Fresh Milk Full Cream',
    category: 'Susu & Dairy',
    unit: 'ml',
    currentStock: 12000,
    minimumStock: 4000,
    costPerUnit: 24, // Rp 24 / ml (Rp 24.000 / liter)
    supplier: 'Greenfield Dairy',
    description: 'Fresh pasteurized milk kemasan 1 Liter',
    status: 'Aman',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-3',
    sku: 'BHK-SYR-01',
    name: 'Sirup Karamel Gourmet',
    category: 'Sirup & Perisa',
    unit: 'ml',
    currentStock: 450,
    minimumStock: 600, // Di bawah minimum!
    costPerUnit: 85, // Rp 85 / ml
    supplier: 'Monin Official',
    description: 'Sirup karamel botol 750ml untuk macchiato',
    status: 'Menipis',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-4',
    sku: 'BHK-SYR-02',
    name: 'Sirup Vanilla Madagaskar',
    category: 'Sirup & Perisa',
    unit: 'ml',
    currentStock: 1400,
    minimumStock: 600,
    costPerUnit: 85,
    supplier: 'Monin Official',
    description: 'Sirup perisa vanila lembut premium',
    status: 'Aman',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-5',
    sku: 'BHK-SWT-01',
    name: 'Gula Aren Cair Organik',
    category: 'Pemanis & Gula',
    unit: 'ml',
    currentStock: 2800,
    minimumStock: 1000,
    costPerUnit: 35, // Rp 35 / ml
    supplier: 'Aren Manis Lestari',
    description: 'Gula aren nira murni kental tanpa pemanis buatan',
    status: 'Aman',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-6',
    sku: 'BHK-POW-01',
    name: 'Matcha Uji Premium Powder',
    category: 'Powder & Bubuk',
    unit: 'gram',
    currentStock: 180,
    minimumStock: 300, // Di bawah minimum!
    costPerUnit: 480, // Rp 480 / gram
    supplier: 'Kyoto Import Tea',
    description: 'Bubuk green tea matcha asli Kyoto ceremonial grade',
    status: 'Menipis',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-7',
    sku: 'BHK-POW-02',
    name: 'Cokelat Bubuk Belgia Dark',
    category: 'Powder & Bubuk',
    unit: 'gram',
    currentStock: 1100,
    minimumStock: 500,
    costPerUnit: 220,
    supplier: 'Barry Callebaut',
    description: 'Pure cocoa powder dark 100% tanpa ampas',
    status: 'Aman',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-8',
    sku: 'BHK-PKG-01',
    name: 'Paper Cup Hot 8oz',
    category: 'Packaging & Kemasan',
    unit: 'pcs',
    currentStock: 420,
    minimumStock: 150,
    costPerUnit: 850,
    supplier: 'Mitra Kemasan Utama',
    description: 'Gelas kertas kraft double wall tahan panas',
    status: 'Aman',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-9',
    sku: 'BHK-PKG-02',
    name: 'Plastic Cup Cold 12oz & Strawless Lid',
    category: 'Packaging & Kemasan',
    unit: 'pcs',
    currentStock: 85,
    minimumStock: 200, // Di bawah minimum!
    costPerUnit: 1250,
    supplier: 'Mitra Kemasan Utama',
    description: 'Cup plastik tebal cold drink + tutup sips lid',
    status: 'Menipis',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-10',
    sku: 'BHK-PKG-03',
    name: 'Sedotan Kertas Steril 8mm',
    category: 'Packaging & Kemasan',
    unit: 'pcs',
    currentStock: 0,
    minimumStock: 100, // Habis!
    costPerUnit: 180,
    supplier: 'Eco Straw Nusantara',
    description: 'Sedotan ramah lingkungan steril bungkus kertas',
    status: 'Habis',
    updatedAt: new Date().toISOString(),
  },
];

// Initial Standard Café Recipes
export const DEFAULT_RECIPES = {
  // mapped by product name or id
  'Espresso Single': [
    { ingredientId: 'ing-1', quantity: 9, unit: 'gram' },
    { ingredientId: 'ing-8', quantity: 1, unit: 'pcs' },
  ],
  'Espresso Double': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-8', quantity: 1, unit: 'pcs' },
  ],
  'Americano Hot': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-8', quantity: 1, unit: 'pcs' },
  ],
  'Americano Ice': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  ],
  'Caffe Latte': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-2', quantity: 180, unit: 'ml' },
    { ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  ],
  'Cappuccino': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-2', quantity: 150, unit: 'ml' },
    { ingredientId: 'ing-8', quantity: 1, unit: 'pcs' },
  ],
  'Kopi Susu Gula Aren': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-2', quantity: 150, unit: 'ml' },
    { ingredientId: 'ing-5', quantity: 30, unit: 'ml' },
    { ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  ],
  'Caramel Macchiato': [
    { ingredientId: 'ing-1', quantity: 18, unit: 'gram' },
    { ingredientId: 'ing-2', quantity: 160, unit: 'ml' },
    { ingredientId: 'ing-3', quantity: 25, unit: 'ml' },
    { ingredientId: 'ing-4', quantity: 10, unit: 'ml' },
    { ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  ],
  'Matcha Latte': [
    { ingredientId: 'ing-6', quantity: 15, unit: 'gram' },
    { ingredientId: 'ing-2', quantity: 180, unit: 'ml' },
    { ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  ],
  'Belgian Hot Chocolate': [
    { ingredientId: 'ing-7', quantity: 30, unit: 'gram' },
    { ingredientId: 'ing-2', quantity: 200, unit: 'ml' },
    { ingredientId: 'ing-8', quantity: 1, unit: 'pcs' },
  ],
};

// Initial Stock Opname Sessions (Beban & Riwayat Selisih)
export const DEFAULT_OPNAMES = [
  {
    id: 'OPN-20261010-01',
    code: 'SO-2026-001',
    date: '2026-10-10T16:30:00.000Z',
    checker: 'Budi Santoso (Supervisor Bar)',
    notes: 'Stock opname mingguan station barista & gudang bahan kering.',
    totalItemsChecked: 5,
    itemsWithDiff: 3,
    totalLossValue: 147600, // Total Beban Selisih (Rp)
    status: 'Selesai & Disesuaikan',
    items: [
      {
        ingredientId: 'ing-1',
        name: 'Biji Kopi Arabika House Blend',
        unit: 'gram',
        costPerUnit: 280,
        systemStock: 3750,
        physicalStock: 3500,
        diff: -250,
        lossValue: 70000,
        bebanCategory: 'beban_pemborosan', // Tumpah saat kalibrasi grinder
        reasonLabel: 'Beban Pemborosan / Tumpah (Kalibrasi Grinder)',
        notes: 'Terbuang saat setting dial gilingan espresso pagi',
      },
      {
        ingredientId: 'ing-2',
        name: 'Susu Fresh Milk Full Cream',
        unit: 'ml',
        costPerUnit: 24,
        systemStock: 13500,
        physicalStock: 12000,
        diff: -1500,
        lossValue: 36000,
        bebanCategory: 'beban_kerusakan', // Basi / Melewati shelf life
        reasonLabel: 'Beban Kerusakan / Basi',
        notes: '2 kotak susu rusak segel bocor & basi saat defrosting',
      },
      {
        ingredientId: 'ing-3',
        name: 'Sirup Karamel Gourmet',
        unit: 'ml',
        costPerUnit: 85,
        systemStock: 940,
        physicalStock: 450,
        diff: -490,
        lossValue: 41650,
        bebanCategory: 'beban_kehilangan', // Pecah / Selisih fisik
        reasonLabel: 'Beban Kehilangan / Selisih Fisik',
        notes: '1 botol kaca retak saat penataan rak display bar',
      },
      {
        ingredientId: 'ing-5',
        name: 'Gula Aren Cair Organik',
        unit: 'ml',
        costPerUnit: 35,
        systemStock: 2800,
        physicalStock: 2800,
        diff: 0,
        lossValue: 0,
        bebanCategory: 'cocok',
        reasonLabel: 'Sesuai (Nihil Selisih)',
        notes: 'Stok fisik sesuai catatan kasir',
      },
      {
        ingredientId: 'ing-8',
        name: 'Paper Cup Hot 8oz',
        unit: 'pcs',
        costPerUnit: 850,
        systemStock: 420,
        physicalStock: 420,
        diff: 0,
        lossValue: 0,
        bebanCategory: 'cocok',
        reasonLabel: 'Sesuai (Nihil Selisih)',
        notes: 'Hitungan fisik cocok',
      },
    ],
  },
];

// Initial Mutations Log
export const DEFAULT_MUTATIONS = [
  {
    id: 'MUT-001',
    date: '2026-10-10T16:30:00.000Z',
    ingredientId: 'ing-1',
    ingredientName: 'Biji Kopi Arabika House Blend',
    type: 'stock_opname',
    changeAmount: -250,
    unit: 'gram',
    costPerUnit: 280,
    bebanCategory: 'beban_pemborosan',
    bebanAmount: 70000,
    reference: 'SO-2026-001',
    notes: 'Penyesuaian hasil Stock Opname mingguan (Beban Pemborosan)',
  },
  {
    id: 'MUT-002',
    date: '2026-10-10T16:30:00.000Z',
    ingredientId: 'ing-2',
    ingredientName: 'Susu Fresh Milk Full Cream',
    type: 'stock_opname',
    changeAmount: -1500,
    unit: 'ml',
    costPerUnit: 24,
    bebanCategory: 'beban_kerusakan',
    bebanAmount: 36000,
    reference: 'SO-2026-001',
    notes: 'Penyesuaian hasil Stock Opname mingguan (Beban Basi)',
  },
  {
    id: 'MUT-003',
    date: '2026-10-09T09:15:00.000Z',
    ingredientId: 'ing-1',
    ingredientName: 'Biji Kopi Arabika House Blend',
    type: 'restock',
    changeAmount: 5000,
    unit: 'gram',
    costPerUnit: 280,
    bebanCategory: null,
    bebanAmount: 0,
    reference: 'PO-RN-9921',
    notes: 'Penerimaan stok dari Roastery Nusantara',
  },
];

export const BEBAN_CATEGORIES = [
  {
    id: 'beban_kerusakan',
    label: 'Beban Kerusakan / Basi',
    description: 'Bahan kadaluarsa, basi, kemasan pecah, atau rusak fisik',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    id: 'beban_pemborosan',
    label: 'Beban Pemborosan / Waste',
    description: 'Tumpah di bar, salah bikin pesanan, kalibrasi mesin/grinder',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    id: 'beban_kehilangan',
    label: 'Beban Kehilangan / Selisih Fisik',
    description: 'Selisih hitung riil, barang hilang, atau pemakaian tak tercatat',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  {
    id: 'beban_takaran',
    label: 'Beban Koreksi Takaran / Overpour',
    description: 'Takaran barista melebihi SOP standar resep',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    id: 'surplus',
    label: 'Surplus Fisik (Koreksi Lebih)',
    description: 'Stok fisik lebih banyak daripada sistem',
    color: '#10B981',
    bg: '#ECFDF5',
  },
];

// Helper: Calculate status based on minimumStock tolerance
export function computeStockStatus(currentStock, minimumStock) {
  const stock = Number(currentStock) || 0;
  const min = Number(minimumStock) || 0;

  if (stock <= 0) return 'Habis';
  if (stock <= min) return 'Menipis';
  return 'Aman';
}

// LocalStorage Persistence Helpers
function getStoredData(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function setStoredData(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Error writing ${key} to storage:`, err);
  }
}

// ==========================================
// 1. INGREDIENTS (BAHAN BAKU) API & METHODS
// ==========================================

export async function fetchIngredients(filters = {}) {
  // First attempt backend API if available
  try {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/inventory/ingredients?${query}` : '/inventory/ingredients';
    const res = await apiRequest(endpoint, { method: 'GET' });
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
  } catch (_backendErr) {
    // Graceful fallback to persistent local storage cache
  }

  const list = getStoredData(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
  return list.map(item => ({
    ...item,
    status: computeStockStatus(item.currentStock, item.minimumStock),
  }));
}

export async function createIngredient(ingredientData) {
  const current = getStoredData(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
  const newId = `ing-${Date.now()}`;
  const sku = ingredientData.sku?.trim() || `BHK-${String(current.length + 1).padStart(3, '0')}`;
  
  const newItem = {
    id: newId,
    sku,
    name: ingredientData.name?.trim() || 'Bahan Baku Baru',
    category: ingredientData.category || 'Bahan Umum',
    unit: ingredientData.unit || 'gram',
    currentStock: Number(ingredientData.currentStock) || 0,
    minimumStock: Number(ingredientData.minimumStock) || 0,
    costPerUnit: Number(ingredientData.costPerUnit) || 0,
    supplier: ingredientData.supplier?.trim() || '-',
    description: ingredientData.description?.trim() || '',
    status: computeStockStatus(ingredientData.currentStock, ingredientData.minimumStock),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  setStoredData(STORAGE_KEYS.INGREDIENTS, updated);

  // Record initial mutation
  if (newItem.currentStock > 0) {
    recordStockMutation({
      ingredientId: newItem.id,
      ingredientName: newItem.name,
      type: 'initial_stock',
      changeAmount: newItem.currentStock,
      unit: newItem.unit,
      costPerUnit: newItem.costPerUnit,
      notes: 'Stok awal pendaftaran bahan baku baru',
    });
  }

  // Also try backend sync
  try {
    await apiRequest('/inventory/ingredients', {
      method: 'POST',
      body: JSON.stringify(newItem),
    });
  } catch (_e) {
    // persistent local store already updated
  }

  return { success: true, data: newItem };
}

export async function updateIngredient(id, ingredientData) {
  const current = getStoredData(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
  const index = current.findIndex(i => i.id === id);
  if (index === -1) {
    return { success: false, error: 'Bahan baku tidak ditemukan.' };
  }

  const prev = current[index];
  const updatedItem = {
    ...prev,
    ...ingredientData,
    currentStock: ingredientData.currentStock !== undefined ? Number(ingredientData.currentStock) : prev.currentStock,
    minimumStock: ingredientData.minimumStock !== undefined ? Number(ingredientData.minimumStock) : prev.minimumStock,
    costPerUnit: ingredientData.costPerUnit !== undefined ? Number(ingredientData.costPerUnit) : prev.costPerUnit,
    updatedAt: new Date().toISOString(),
  };
  updatedItem.status = computeStockStatus(updatedItem.currentStock, updatedItem.minimumStock);

  current[index] = updatedItem;
  setStoredData(STORAGE_KEYS.INGREDIENTS, current);

  try {
    await apiRequest(`/inventory/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedItem),
    });
  } catch (_e) {}

  return { success: true, data: updatedItem };
}

export async function deleteIngredient(id) {
  const current = getStoredData(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
  const filtered = current.filter(i => i.id !== id);
  setStoredData(STORAGE_KEYS.INGREDIENTS, filtered);

  try {
    await apiRequest(`/inventory/ingredients/${id}`, { method: 'DELETE' });
  } catch (_e) {}

  return { success: true };
}

export async function restockIngredient(id, { quantity, notes = '', reference = '', costPerUnit }) {
  const current = getStoredData(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
  const index = current.findIndex(i => i.id === id);
  if (index === -1) return { success: false, error: 'Bahan baku tidak ditemukan.' };

  const item = current[index];
  const qtyNum = Number(quantity) || 0;
  if (qtyNum <= 0) return { success: false, error: 'Jumlah restock harus lebih dari 0.' };

  const newStock = item.currentStock + qtyNum;
  const newCost = costPerUnit !== undefined && Number(costPerUnit) > 0 ? Number(costPerUnit) : item.costPerUnit;

  const updatedItem = {
    ...item,
    currentStock: newStock,
    costPerUnit: newCost,
    status: computeStockStatus(newStock, item.minimumStock),
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStoredData(STORAGE_KEYS.INGREDIENTS, current);

  // Record mutation
  recordStockMutation({
    ingredientId: item.id,
    ingredientName: item.name,
    type: 'restock',
    changeAmount: qtyNum,
    unit: item.unit,
    costPerUnit: newCost,
    reference: reference || `RESTOCK-${Date.now().toString().slice(-6)}`,
    notes: notes || 'Penerimaan stok bahan baku baru',
  });

  return { success: true, data: updatedItem };
}

// ==========================================
// 2. RECIPES (RESEP PRODUK & BOM) METHODS
// ==========================================

export async function fetchAllRecipes() {
  const recipes = getStoredData(STORAGE_KEYS.RECIPES, DEFAULT_RECIPES);
  return recipes;
}

export async function getRecipeForProduct(productIdentifier) {
  const recipes = getStoredData(STORAGE_KEYS.RECIPES, DEFAULT_RECIPES);
  // Match by id or by name
  if (recipes[productIdentifier]) return recipes[productIdentifier];

  // Try lowercased / trimmed matching
  const targetKey = Object.keys(recipes).find(k => 
    k.toLowerCase().trim() === String(productIdentifier).toLowerCase().trim()
  );
  return targetKey ? recipes[targetKey] : [];
}

export async function saveProductRecipe(productIdentifier, recipeItems) {
  const recipes = getStoredData(STORAGE_KEYS.RECIPES, DEFAULT_RECIPES);
  const cleanKey = String(productIdentifier).trim();
  
  // recipeItems: array of { ingredientId, quantity, unit, customNote }
  recipes[cleanKey] = (recipeItems || []).map(r => ({
    ingredientId: r.ingredientId,
    quantity: Number(r.quantity) || 0,
    unit: r.unit || 'gram',
    customNote: r.customNote || '',
  }));

  setStoredData(STORAGE_KEYS.RECIPES, recipes);

  // Attempt backend persistence
  try {
    await apiRequest(`/inventory/recipes/${encodeURIComponent(cleanKey)}`, {
      method: 'PUT',
      body: JSON.stringify({ items: recipes[cleanKey] }),
    });
  } catch (_e) {}

  return { success: true, data: recipes[cleanKey] };
}

/**
 * Calculate financial BOM metrics for a product recipe:
 * - Total HPP (Cost of Goods Sold)
 * - Gross Profit Margin (Rp & %)
 * - Portions Available based on current inventory!
 */
export function calculateRecipeFinancials(recipeItems = [], ingredients = [], sellingPrice = 0) {
  let totalHPP = 0;
  let maxPortions = Infinity;
  let bottleneckIngredient = null;

  const resolvedItems = (recipeItems || []).map(item => {
    const matchedIng = ingredients.find(ing => ing.id === item.ingredientId);
    const costPerUnit = matchedIng ? (Number(matchedIng.costPerUnit) || 0) : 0;
    const itemSubtotal = (Number(item.quantity) || 0) * costPerUnit;
    totalHPP += itemSubtotal;

    // Check how many portions can be served based on current stock
    if (matchedIng && Number(item.quantity) > 0) {
      const availableForThis = Math.floor(Math.max(0, matchedIng.currentStock) / Number(item.quantity));
      if (availableForThis < maxPortions) {
        maxPortions = availableForThis;
        bottleneckIngredient = matchedIng;
      }
    }

    return {
      ...item,
      ingredientName: matchedIng?.name || 'Bahan Baku',
      costPerUnit,
      itemSubtotal,
      currentStock: matchedIng?.currentStock || 0,
      stockStatus: matchedIng?.status || 'Aman',
    };
  });

  if (maxPortions === Infinity) maxPortions = 0;

  const price = Number(sellingPrice) || 0;
  const grossProfit = Math.max(0, price - totalHPP);
  const marginPercent = price > 0 ? ((grossProfit / price) * 100).toFixed(1) : '0';

  return {
    totalHPP,
    grossProfit,
    marginPercent: Number(marginPercent),
    portionsAvailable: maxPortions,
    bottleneckIngredient,
    items: resolvedItems,
  };
}

// ==========================================
// 3. STOCK OPNAME & BEBAN LOSS METHODS
// ==========================================

export async function fetchStockOpnames() {
  const list = getStoredData(STORAGE_KEYS.OPNAME_SESSIONS, DEFAULT_OPNAMES);
  return list;
}

export async function submitStockOpname({ checker, notes, opnameItems = [] }) {
  const allIngredients = getStoredData(STORAGE_KEYS.INGREDIENTS, DEFAULT_INGREDIENTS);
  const now = new Date();
  const sessionCode = `SO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;
  
  let totalLossValue = 0;
  let itemsWithDiff = 0;

  const processedItems = opnameItems.map(item => {
    const original = allIngredients.find(ing => ing.id === item.ingredientId);
    const systemStock = original ? original.currentStock : Number(item.systemStock) || 0;
    const physicalStock = Number(item.physicalStock) || 0;
    const diff = physicalStock - systemStock;
    const costPerUnit = original ? original.costPerUnit : Number(item.costPerUnit) || 0;
    
    // Loss only applies if physical < system (selisih negatif)
    const lossValue = diff < 0 ? Math.abs(diff) * costPerUnit : 0;
    if (diff !== 0) {
      itemsWithDiff += 1;
      totalLossValue += lossValue;
    }

    // Resolve category label
    const categoryObj = BEBAN_CATEGORIES.find(b => b.id === item.bebanCategory);
    const reasonLabel = categoryObj ? categoryObj.label : (diff === 0 ? 'Sesuai (Nihil Selisih)' : 'Penyesuaian Selisih');

    // Update ingredient stock in master list
    if (original) {
      original.currentStock = physicalStock;
      original.status = computeStockStatus(physicalStock, original.minimumStock);
      original.updatedAt = now.toISOString();

      // Record mutation for audit log
      if (diff !== 0) {
        recordStockMutation({
          ingredientId: original.id,
          ingredientName: original.name,
          type: 'stock_opname',
          changeAmount: diff,
          unit: original.unit,
          costPerUnit,
          bebanCategory: item.bebanCategory || 'beban_kehilangan',
          bebanAmount: lossValue,
          reference: sessionCode,
          notes: item.notes || `Stock Opname selisih ${diff} ${original.unit} (${reasonLabel})`,
        });
      }
    }

    return {
      ingredientId: item.ingredientId,
      name: original?.name || item.name || 'Bahan',
      unit: original?.unit || item.unit || 'unit',
      costPerUnit,
      systemStock,
      physicalStock,
      diff,
      lossValue,
      bebanCategory: item.bebanCategory || (diff === 0 ? 'cocok' : 'beban_kehilangan'),
      reasonLabel,
      notes: item.notes || '',
    };
  });

  // Save updated master ingredients
  setStoredData(STORAGE_KEYS.INGREDIENTS, allIngredients);

  const newSession = {
    id: `OPN-${Date.now()}`,
    code: sessionCode,
    date: now.toISOString(),
    checker: checker?.trim() || 'Admin Bertugas',
    notes: notes?.trim() || 'Stock Opname reguler',
    totalItemsChecked: processedItems.length,
    itemsWithDiff,
    totalLossValue,
    status: 'Selesai & Disesuaikan',
    items: processedItems,
  };

  const currentSessions = getStoredData(STORAGE_KEYS.OPNAME_SESSIONS, DEFAULT_OPNAMES);
  const updatedSessions = [newSession, ...currentSessions];
  setStoredData(STORAGE_KEYS.OPNAME_SESSIONS, updatedSessions);

  return { success: true, data: newSession };
}

// ==========================================
// 4. MUTATION HISTORY
// ==========================================

export function recordStockMutation(mutation) {
  const current = getStoredData(STORAGE_KEYS.MUTATIONS, DEFAULT_MUTATIONS);
  const newMutation = {
    id: `MUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString(),
    ...mutation,
  };
  setStoredData(STORAGE_KEYS.MUTATIONS, [newMutation, ...current]);
  return newMutation;
}

export async function fetchStockMutations() {
  return getStoredData(STORAGE_KEYS.MUTATIONS, DEFAULT_MUTATIONS);
}

export default {
  fetchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  restockIngredient,
  fetchAllRecipes,
  getRecipeForProduct,
  saveProductRecipe,
  calculateRecipeFinancials,
  fetchStockOpnames,
  submitStockOpname,
  fetchStockMutations,
  computeStockStatus,
  BEBAN_CATEGORIES,
};
