/**
 * Generator nomor transaksi POSAN berformat:
 * [INISIAL_HARI]-[DDMMYY]-[4_DIGIT_RANDOM]
 * Contoh: SEN-051026-4829, SEL-061026-7104
 */
export function generateTransactionCode(date = new Date()) {
  const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
  const dayName = days[date.getDay()] || 'POS';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${dayName}-${dd}${mm}${yy}-${randomNum}`;
}

export default generateTransactionCode;
