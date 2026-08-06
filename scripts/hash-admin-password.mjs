import crypto from 'node:crypto';

const password = process.argv[2] || 'oilganic2026';

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

const hashedPassword = hashPassword(password);

console.log('==================================================');
console.log('Oilganic Admin Password Scrypt Generator');
console.log('==================================================');
console.log(`Plain Password : ${password}`);
console.log(`Scrypt Hash    : ${hashedPassword}`);
console.log('==================================================');
console.log('Set this variable in your Netlify Dashboard Environment Variables:');
console.log(`ADMIN_PASSWORD_SCRYPT=${hashedPassword}`);
console.log('');
console.log('PowerShell command to set locally:');
console.log(`$env:ADMIN_PASSWORD_SCRYPT="${hashedPassword}"`);
console.log('==================================================');
