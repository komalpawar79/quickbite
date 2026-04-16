/**
 * Encryption Service - Encrypt/Decrypt Sensitive Data
 */

import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const encryptionKey = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || 'default-encryption-key')
  .digest();

/**
 * Encrypt sensitive data
 */
export const encryptData = (data) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption Error]:', error);
    return data;
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData) => {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      console.error('[Decryption Error]: Invalid format');
      return null;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Decryption Error]:', error);
    return null;
  }
};

/**
 * Hash password
 */
export const hashPassword = (password) => {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
};

/**
 * Hash sensitive field for comparison
 */
export const hashField = (field) => {
  return crypto
    .createHash('sha256')
    .update(field + process.env.HASH_SALT)
    .digest('hex');
};

/**
 * Generate secure token
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Encrypt phone number
 */
export const encryptPhoneNumber = (phone) => {
  return encryptData(phone);
};

/**
 * Decrypt phone number
 */
export const decryptPhoneNumber = (encryptedPhone) => {
  return decryptData(encryptedPhone);
};

/**
 * Encrypt email
 */
export const encryptEmail = (email) => {
  return encryptData(email);
};

/**
 * Decrypt email
 */
export const decryptEmail = (encryptedEmail) => {
  return decryptData(encryptedEmail);
};

/**
 * Encrypt payment token
 */
export const encryptPaymentToken = (token) => {
  return encryptData(token);
};

/**
 * Decrypt payment token
 */
export const decryptPaymentToken = (encryptedToken) => {
  return decryptData(encryptedToken);
};

/**
 * Mask phone number (display only last 4 digits)
 */
export const maskPhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return 'XXXXX' + cleanPhone.slice(-5);
};

/**
 * Mask email (display only username)
 */
export const maskEmail = (email) => {
  const [username] = email.split('@');
  return username + '@***';
};

/**
 * Mask payment card (display only last 4 digits)
 */
export const maskPaymentCard = (cardNumber) => {
  const last4 = cardNumber.slice(-4);
  return 'XXXX-XXXX-XXXX-' + last4;
};

/**
 * Secure comparison (prevent timing attacks)
 */
export const secureCompare = (a, b) => {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Generate OTP
 */
export const generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Verify OTP (with expiry)
 */
export const verifyOTP = (inputOTP, storedOTP, expiryTime) => {
  if (!inputOTP || !storedOTP) {
    return false;
  }
  
  // Check if OTP expired (default 5 minutes)
  const timeElapsed = Date.now() - expiryTime;
  if (timeElapsed > 5 * 60 * 1000) {
    return false;
  }

  return secureCompare(inputOTP, storedOTP);
};

/**
 * Generate JWT Token
 */
export const generateJWTToken = (payload, secret, expiresIn = '24h') => {
  // This would typically use jsonwebtoken library
  // Here's a simplified version for reference
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

/**
 * Encrypt MongoDB query for privacy
 */
export const encryptQueryValue = (value) => {
  return encryptData(value.toString());
};

/**
 * Create encryption audit log
 */
export const logEncryptionEvent = (eventType, fieldName, userId, action) => {
  const log = {
    timestamp: new Date(),
    eventType, // 'encrypt', 'decrypt', 'hash'
    fieldName,
    userId,
    action, // 'create', 'update', 'read'
    ipAddress: process.env.CLIENT_IP || 'unknown'
  };
  console.log('[Encryption Audit]', JSON.stringify(log));
  return log;
};
