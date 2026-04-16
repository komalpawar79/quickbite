/**
 * Two-Factor Authentication (2FA) Service
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate 2FA Secret and QR Code
 */
export const generate2FASecret = async (email) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `QuickBite (${email})`,
      issuer: 'QuickBite Canteen System',
      length: 32
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
      otpauthUrl: secret.otpauth_url
    };
  } catch (error) {
    throw new Error(`Failed to generate 2FA secret: ${error.message}`);
  }
};

/**
 * Verify 2FA Token
 */
export const verify2FAToken = (token, secret) => {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow token from ±2 time steps
    });

    return verified;
  } catch (error) {
    return false;
  }
};

/**
 * Generate Backup Codes
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Verify Backup Code
 */
export const verifyBackupCode = (code, backupCodes) => {
  const index = backupCodes.indexOf(code);
  if (index > -1) {
    backupCodes.splice(index, 1); // Remove used code
    return true;
  }
  return false;
};
