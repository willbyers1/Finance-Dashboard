import crypto from 'node:crypto';

// Server-side encryption key derived from environment variable ENCRYPTION_KEY or fallback
const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY || 'default_fintech_secure_encryption_key_32bytes';
  // Always produce a 32-byte key via SHA-256 hash
  return crypto.createHash('sha256').update(secret).digest();
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM

export function encryptAccessToken(plainText: string): string {
  if (!plainText) return '';
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    // Fallback simple obfuscation for safe operation if crypto fails
    return `obf:${Buffer.from(plainText).toString('base64')}`;
  }
}

export function decryptAccessToken(cipherText: string): string {
  if (!cipherText) return '';
  
  if (cipherText.startsWith('obf:')) {
    return Buffer.from(cipherText.slice(4), 'base64').toString('utf8');
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return cipherText;
  }
}
