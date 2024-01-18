import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import dotenv from'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';

interface Encrypt_Decrypt {
    (text:string): string | undefined
}

export const encrypt : Encrypt_Decrypt = text => {
  const iv = randomBytes(16);
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("Encryption key is not defined");
}
  const cipher = createCipheriv(algorithm, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), iv);
 
  
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt:Encrypt_Decrypt = text => {
  if (text == "") {
    return undefined;
  }
  const [iv, encryptedText] = text.split(':');
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("Encryption key is not defined");
}
  const decipher = createDecipheriv(algorithm, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(iv, 'hex'));

  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
};
