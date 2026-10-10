// RFC 6238 TOTP (Time-based One-Time Password) implementation for Google Authenticator
// Compatible with Google Authenticator, Microsoft Authenticator, Authy, and other standard TOTP apps

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a random Base32 secret string (default 16 chars / 80 bits, standard for TOTP)
 */
export function generateBase32Secret(length = 16) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE32_CHARS[bytes[i] % 32];
  }
  return result;
}

/**
 * Decode Base32 string to Uint8Array bytes
 */
export function base32ToBytes(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  const bytes = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bytes.push((buffer >> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Generate 6-digit TOTP code for a given secret at specified timestamp
 */
export async function generateTotpCode(secret, timestamp = Date.now(), period = 30) {
  const counter = Math.floor(timestamp / 1000 / period);
  const keyBytes = base32ToBytes(secret);

  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const hmac = await crypto.subtle.sign('HMAC', cryptoKey, counterBytes);
  const hmacBytes = new Uint8Array(hmac);

  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP code against a secret (or list of secrets) with tolerance window (default ±4 intervals = ±120s)
 */
export async function verifyTotpCode(secretOrSecrets, inputCode, window = 4, period = 30) {
  if (!secretOrSecrets || !inputCode) return false;
  const cleanCode = inputCode.toString().trim().replace(/\s+/g, '');
  if (cleanCode.length !== 6) return false;

  const secrets = Array.isArray(secretOrSecrets) ? secretOrSecrets : [secretOrSecrets];
  const now = Date.now();

  for (const rawSecret of secrets) {
    if (!rawSecret) continue;
    const cleanSecret = rawSecret.toString().replace(/[\s-]/g, '').toUpperCase();
    
    for (let i = -window; i <= window; i++) {
      try {
        const time = now + i * period * 1000;
        const generated = await generateTotpCode(cleanSecret, time, period);
        if (generated === cleanCode) {
          return true;
        }
      } catch {
        // Skip invalid secret format
      }
    }
  }

  return false;
}

/**
 * Build standard otpauth:// URL for Google Authenticator QR Code
 */
export function getTotpUri({ secret, issuer = 'POSAN', accountName = 'Super Admin' }) {
  const cleanIssuer = encodeURIComponent(issuer);
  const cleanAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${cleanIssuer}:${cleanAccount}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate high-quality QR code image URL for scanning
 */
export function getQrCodeUrl(uri) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(uri)}`;
}
