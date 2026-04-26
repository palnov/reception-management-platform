import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scrypt(password, salt, KEY_LENGTH) as Buffer;
    return `${HASH_PREFIX}$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedPassword: string) {
    const [prefix, salt, key] = storedPassword.split('$');

    if (prefix !== HASH_PREFIX || !salt || !key) {
        return password === storedPassword;
    }

    const storedKey = Buffer.from(key, 'hex');
    const derivedKey = await scrypt(password, salt, storedKey.length) as Buffer;

    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export function isHashedPassword(password: string) {
    return password.startsWith(`${HASH_PREFIX}$`);
}
