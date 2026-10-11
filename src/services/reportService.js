import { fetchTransactions, parseTrxDate } from './transactionService.js';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizePaymentMethod(pm) {
  if (!pm) return 'qris';
  const s = String(pm).toLowerCase().trim();
  if (s === 'cash' || s === 'tunai' || s.includes('tunai') || s.includes('cash')) return 'cash';
  if (s === 'bank' || s === 'debit' || s.includes('bank') || s.includes('debit') || s.includes('transfer') || s.includes('bca') || s.includes('mandiri')) return 'bank';
  if (s === 'qris' || s.includes('qris') || s.includes('gopay') || s.includes('shopee') || s.includes('ovo') || s.includes('dana')) return 'qris';
  return s;
}

function matchesCashier(trx, cashier) {
  if (!cashier || cashier === 'all') return true;
  const target = cashier.toLowerCase().trim();
  const cName = (trx.cashierName || trx.cashier_name || '').toLowerCase();
  const cId = (trx.cashier_id || trx.cashierId || trx.userId || '').toLowerCase();
  return cName.includes(target) || target.includes(cName) || cId === target;
}

function matchesPaymentMethod(trx, method) {
  if (!method || method === 'all') return true;
  const target = normalizePaymentMethod(method);
  const trxMethod = normalizePaymentMethod(trx.paymentMethod || trx.payment_method);
  return trxMethod === target;
}

export async function fetchReportData(periodId = 'thisMonth', cashier = 'all', method = 'all', customStart = null, customEnd = null) {
  try {
    const rawTransactions = await fetchTransactions();

    const now = new Date();
    const refYear = now.getFullYear();
    const refMonth = now.getMonth();
    const refDate = now.getDate();

    // 1. Filter transactions by date period
    let dateFiltered = [];

    if (periodId === 'today') {
      const todayKey = formatDateKey(now);
      dateFiltered = rawTransactions.filter((t) => formatDateKey(parseTrxDate(t.created_at)) === todayKey);
    } else if (periodId === '7days' || periodId === 'week') {
      const start7 = new Date(refYear, refMonth, refDate - 6);
      start7.setHours(0, 0, 0, 0);
      dateFiltered = rawTransactions.filter((t) => parseTrxDate(t.created_at) >= start7);
    } else if (periodId === '30days' || periodId === 'month') {
      const start30 = new Date(refYear, refMonth, refDate - 29);
      start30.setHours(0, 0, 0, 0);
      dateFiltered = rawTransactions.filter((t) => parseTrxDate(t.created_at) >= start30);
    } else if (periodId === 'custom' && customStart && customEnd) {
      const cStart = new Date(customStart);
      cStart.setHours(0, 0, 0, 0);
      const cEnd = new Date(customEnd);
      cEnd.setHours(23, 59, 59, 999);
      dateFiltered = rawTransactions.filter((t) => {
        const d = parseTrxDate(t.created_at);
        return d >= cStart && d <= cEnd;
      });
    } else {
      // thisMonth (default)
      const startMonth = new Date(refYear, refMonth, 1);
      startMonth.setHours(0, 0, 0, 0);
      dateFiltered = rawTransactions.filter((t) => parseTrxDate(t.created_at) >= startMonth);
    }

    // 2. Filter transactions by cashier and payment method
    const filtered = dateFiltered.filter((trx) => {
      return matchesCashier(trx, cashier) && matchesPaymentMethod(trx, method);
    });

    // 3. Compute KPI metrics
    const totalTransactions = filtered.length;
    const totalSales = filtered.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
    const totalItems = filtered.reduce((sum, t) => {
      return sum + (t.items || []).reduce((iSum, it) => iSum + (Number(it.qty) || 1), 0);
    }, 0);
    const avgTrx = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    const kpi = {
      totalTransactions: {
        label: 'TOTAL TRANSAKSI',
        value: totalTransactions,
        formattedValue: `${totalTransactions}`,
        changeText: '+100%',
        isPositive: true,
        comparisonText: 'Data Live database',
        iconType: 'receipt',
      },
      totalSales: {
        label: 'TOTAL PENJUALAN',
        value: totalSales,
        formattedValue: `Rp${totalSales.toLocaleString('id-ID')}`,
        changeText: '+100%',
        isPositive: true,
        comparisonText: 'Data Live database',
        iconType: 'wallet',
      },
      productsSold: {
        label: 'PRODUK TERJUAL',
        value: totalItems,
        unit: 'item',
        formattedValue: `${totalItems}`,
        changeText: '+100%',
        isPositive: true,
        comparisonText: 'Data Live database',
        iconType: 'coffee',
      },
      averageTransaction: {
        label: 'RATA-RATA TRANSAKSI',
        value: avgTrx,
        formattedValue: `Rp${avgTrx.toLocaleString('id-ID')}`,
        changeText: '+100%',
        isPositive: true,
        comparisonText: 'Data Live database',
        iconType: 'chart',
      },
    };

    // 4. Compute Top Selling Products
    const productStatsMap = {};
    filtered.forEach((t) => {
      (t.items || []).forEach((it) => {
        const name = it.name || 'Menu';
        const qty = Number(it.qty) || 1;
        const price = Number(it.price) || 0;
        const sub = Number(it.subtotal) || (qty * price);
        const category = it.category || 'Menu Kafe';

        if (!productStatsMap[name]) {
          productStatsMap[name] = {
            id: it.id || it.product_id || `prod-${name}`,
            name,
            category,
            unitPrice: price > 0 ? price : (qty > 0 ? Math.round(sub / qty) : 0),
            count: 0,
            revenue: 0,
          };
        } else {
          if (price > 0 && productStatsMap[name].unitPrice === 0) {
            productStatsMap[name].unitPrice = price;
          }
        }
        productStatsMap[name].count += qty;
        productStatsMap[name].revenue += sub;
      });
    });

    const sortedProducts = Object.entries(productStatsMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    const maxProductCount = sortedProducts.length > 0 ? sortedProducts[0][1].count : 1;

    const topProducts = sortedProducts.map(([name, stat], idx) => ({
      rank: idx + 1,
      id: `prod-0${idx + 1}`,
      name,
      soldCount: stat.count,
      totalSales: stat.revenue,
      formattedSales: `Rp${stat.revenue.toLocaleString('id-ID')}`,
      progressPercentage: Math.round((stat.count / maxProductCount) * 100),
      barColor: idx === 0 ? '#1E1713' : '#8C5E3C',
      rankStyle: idx === 0 ? 'dark' : 'outline',
    }));

    // Comprehensive Product Sales Report Table for all sold items
    const productReportsTable = Object.entries(productStatsMap)
      .map(([name, stat], idx) => {
        const uPrice = stat.unitPrice > 0 ? stat.unitPrice : (stat.count > 0 ? Math.round(stat.revenue / stat.count) : 0);
        const contribPct = totalSales > 0 ? Math.round((stat.revenue / totalSales) * 1000) / 10 : 0;
        
        let salesStatus = 'Normal';
        let statusVariant = 'normal'; // 'top' | 'high' | 'normal'
        if (contribPct >= 20) {
          salesStatus = 'Sangat Laris';
          statusVariant = 'top';
        } else if (contribPct >= 10) {
          salesStatus = 'Laris';
          statusVariant = 'high';
        } else if (stat.count >= 5) {
          salesStatus = 'Stabil';
          statusVariant = 'medium';
        }

        return {
          id: `prod-report-${idx + 1}`,
          productId: stat.id,
          name: stat.name,
          category: stat.category,
          unitPrice: uPrice,
          formattedUnitPrice: `Rp ${uPrice.toLocaleString('id-ID')}`,
          salesCount: stat.count,
          formattedSalesCount: `${stat.count} item`,
          totalSales: stat.revenue,
          formattedTotalSales: `Rp ${stat.revenue.toLocaleString('id-ID')}`,
          percentage: contribPct,
          formattedPercentage: `${contribPct}%`,
          salesStatus,
          statusVariant,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);

    // 5. Compute Payment Methods Breakdown
    let cashCount = 0, cashSum = 0;
    let qrisCount = 0, qrisSum = 0;
    let bankCount = 0, bankSum = 0;

    filtered.forEach((t) => {
      const pm = normalizePaymentMethod(t.paymentMethod || t.payment_method);
      const val = Number(t.total) || 0;
      if (pm === 'cash') {
        cashCount++;
        cashSum += val;
      } else if (pm === 'bank') {
        bankCount++;
        bankSum += val;
      } else {
        qrisCount++;
        qrisSum += val;
      }
    });

    const sumTotal = totalSales || 1;
    let cashPct = totalSales > 0 ? Math.round((cashSum / sumTotal) * 100) : 0;
    let qrisPct = totalSales > 0 ? Math.round((qrisSum / sumTotal) * 100) : 0;
    let bankPct = totalSales > 0 ? Math.max(0, 100 - cashPct - qrisPct) : 0;

    const paymentMethods = {
      totalPercentage: totalSales > 0 ? 100 : 0,
      methods: [
        {
          id: 'cash',
          name: 'Tunai',
          percentage: cashPct,
          nominal: cashSum,
          formattedNominal: `Rp${cashSum.toLocaleString('id-ID')}`,
          orderCount: cashCount,
          color: '#1E1713',
        },
        {
          id: 'qris',
          name: 'QRIS',
          percentage: qrisPct,
          nominal: qrisSum,
          formattedNominal: `Rp${qrisSum.toLocaleString('id-ID')}`,
          orderCount: qrisCount,
          color: '#8C5E3C',
        },
        {
          id: 'bank',
          name: 'Bank/Debit',
          percentage: bankPct,
          nominal: bankSum,
          formattedNominal: `Rp${bankSum.toLocaleString('id-ID')}`,
          orderCount: bankCount,
          color: '#D4A373',
        },
      ],
    };

    // 6. Compute Sales Period Chart Data (Daily, Weekly, Monthly)
    const dailySlots = [];
    const numDailyDays = 5;
    for (let i = numDailyDays - 1; i >= 0; i--) {
      const d = new Date(refYear, refMonth, refDate - i);
      const dayLabel = `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`;
      const fullDate = `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
      const key = formatDateKey(d);
      dailySlots.push({
        date: dayLabel,
        key,
        dayName: DAYS_ID[d.getDay()],
        fullDate,
        sales: 0,
        transactions: 0,
        isPeak: false,
        isLowest: false,
      });
    }

    filtered.forEach((t) => {
      const d = parseTrxDate(t.created_at);
      const key = formatDateKey(d);
      const item = dailySlots.find((x) => x.key === key);
      if (item) {
        item.sales += Number(t.total) || 0;
        item.transactions += 1;
      }
    });

    let maxDailySales = -1;
    let minDailySales = Infinity;
    let peakDayIdx = dailySlots.length - 1;
    let lowestDayIdx = 0;

    dailySlots.forEach((slot, idx) => {
      if (slot.sales > maxDailySales) {
        maxDailySales = slot.sales;
        peakDayIdx = idx;
      }
      if (slot.sales < minDailySales) {
        minDailySales = slot.sales;
        lowestDayIdx = idx;
      }
    });

    if (dailySlots[peakDayIdx]) {
      dailySlots[peakDayIdx].isPeak = true;
      dailySlots[peakDayIdx].peakLabel = `${dailySlots[peakDayIdx].date} (PUNCAK)`;
    }
    if (lowestDayIdx !== peakDayIdx && dailySlots[lowestDayIdx]) {
      dailySlots[lowestDayIdx].isLowest = true;
    }

    const dailyData = dailySlots.map((s) => ({
      date: s.date,
      dayName: s.dayName,
      fullDate: s.fullDate,
      sales: s.sales,
      formattedSales: `Rp${s.sales.toLocaleString('id-ID')}`,
      transactions: s.transactions,
      isPeak: s.isPeak,
      isLowest: s.isLowest,
      peakLabel: s.peakLabel,
    }));

    // Weekly data
    const weeklyData = [
      { date: 'Minggu 1', dayName: 'W1', fullDate: 'Minggu 1', sales: 0, formattedSales: 'Rp0', transactions: 0, isPeak: false },
      { date: 'Minggu 2', dayName: 'W2', fullDate: 'Minggu 2', sales: 0, formattedSales: 'Rp0', transactions: 0, isPeak: false },
      { date: 'Minggu 3', dayName: 'W3', fullDate: 'Minggu 3', sales: 0, formattedSales: 'Rp0', transactions: 0, isPeak: false },
      { date: 'Minggu 4', dayName: 'W4', fullDate: 'Minggu 4 Berjalan', sales: totalSales, formattedSales: `Rp${totalSales.toLocaleString('id-ID')}`, transactions: totalTransactions, isPeak: true, peakLabel: 'W4' },
    ];

    // Monthly data
    const currentMonthLabel = MONTHS_SHORT[refMonth] || 'Bulan Berjalan';
    const monthlyData = [
      { date: currentMonthLabel, dayName: currentMonthLabel, fullDate: `${currentMonthLabel} ${refYear}`, sales: totalSales, formattedSales: `Rp${totalSales.toLocaleString('id-ID')}`, transactions: totalTransactions, isPeak: true, peakLabel: currentMonthLabel },
    ];

    const avgDaily = Math.round(totalSales / numDailyDays);
    const lowestVal = minDailySales === Infinity || minDailySales < 0 ? 0 : minDailySales;
    const peakSlot = dailySlots[peakDayIdx] || dailySlots[0];

    const salesPeriodChart = {
      granularity: 'Harian',
      dailyData,
      weeklyData,
      monthlyData,
      summaryFooter: {
        average: {
          label: `Rata-rata ${numDailyDays} Hari`,
          formattedValue: `Rp${avgDaily.toLocaleString('id-ID')}`,
          rawValue: avgDaily,
        },
        lowest: {
          label: 'Penjualan Terendah',
          formattedValue: `Rp${lowestVal.toLocaleString('id-ID')}`,
          rawValue: lowestVal,
        },
        highest: {
          label: 'Hari Teramai',
          formattedValue: `${peakSlot?.dayName || 'Hari ini'} (${peakSlot?.date || ''})`,
          isHighlight: true,
        },
      },
    };

    // 7. Daily Transactions Summary Table
    const dateGroups = {};
    filtered.forEach((t) => {
      const d = parseTrxDate(t.created_at);
      const fullDate = `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
      if (!dateGroups[fullDate]) {
        dateGroups[fullDate] = { count: 0, total: 0 };
      }
      dateGroups[fullDate].count += 1;
      dateGroups[fullDate].total += Number(t.total) || 0;
    });

    const dailyTransactionsTable = Object.entries(dateGroups).map(([dateStr, stat], idx) => {
      const avg = stat.count > 0 ? Math.round(stat.total / stat.count) : 0;
      return {
        id: `row-${idx + 1}`,
        date: dateStr,
        transactions: stat.count,
        formattedTransactions: `${stat.count} Transaksi`,
        totalSales: stat.total,
        formattedTotalSales: `Rp${stat.total.toLocaleString('id-ID')}`,
        avgTransaction: avg,
        formattedAvgTransaction: `Rp${avg.toLocaleString('id-ID')}`,
        status: 'Selesai',
      };
    });

    const periodLabelMap = {
      today: 'Hari Ini',
      '7days': '7 Hari Terakhir',
      '30days': '30 Hari Terakhir',
      thisMonth: 'Bulan Ini',
      custom: 'Rentang Kustom',
    };

    return {
      periodKey: periodId,
      periodLabel: periodLabelMap[periodId] || periodId,
      kpi,
      salesPeriodChart,
      paymentMethods,
      topProducts,
      productReportsTable,
      dailyTransactionsTable,
    };
  } catch (err) {
    console.error('fetchReportData error:', err);
    return {
      periodKey: periodId,
      periodLabel: 'Laporan Penjualan',
      kpi: {
        totalTransactions: { label: 'TOTAL TRANSAKSI', value: 0, formattedValue: '0', changeText: '0%', isPositive: true, comparisonText: 'Database Live', iconType: 'receipt' },
        totalSales: { label: 'TOTAL PENJUALAN', value: 0, formattedValue: 'Rp0', changeText: '0%', isPositive: true, comparisonText: 'Database Live', iconType: 'wallet' },
        productsSold: { label: 'PRODUK TERJUAL', value: 0, unit: 'item', formattedValue: '0', changeText: '0%', isPositive: true, comparisonText: 'Database Live', iconType: 'coffee' },
        averageTransaction: { label: 'RATA-RATA TRANSAKSI', value: 0, formattedValue: 'Rp0', changeText: '0%', isPositive: true, comparisonText: 'Database Live', iconType: 'chart' },
      },
      salesPeriodChart: { granularity: 'Harian', dailyData: [], weeklyData: [], monthlyData: [], summaryFooter: { average: { label: 'Rata-rata', formattedValue: 'Rp0', rawValue: 0 }, lowest: { label: 'Terendah', formattedValue: 'Rp0', rawValue: 0 }, highest: { label: 'Hari Teramai', formattedValue: '-', isHighlight: true } } },
      paymentMethods: { totalPercentage: 0, methods: [] },
      topProducts: [],
      productReportsTable: [],
      dailyTransactionsTable: [],
    };
  }
}
