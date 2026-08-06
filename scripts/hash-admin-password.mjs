import crypto from 'node:crypto';

const plainPassword = process.argv[2];

if (!plainPassword || typeof plainPassword !== 'string' || !plainPassword.trim()) {
  console.error('Error: Password parameter is missing.');
  console.error('Usage: node scripts/hash-admin-password.mjs <password>');
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

const hashedPassword = hashPassword(plainPassword.trim());

console.log(`ADMIN_PASSWORD_SCRYPT=${hashedPassword}`);
