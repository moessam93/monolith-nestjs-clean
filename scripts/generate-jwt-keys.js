const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 JWT RS256 Key Pair Generator');
console.log('=====================================');

// Get environment from command line arguments
const targetEnv = process.argv[2];
const environments = ['development', 'testing', 'staging', 'production'];

if (targetEnv && !environments.includes(targetEnv)) {
  console.log('❌ Invalid environment. Use: development, testing, staging, or production');
  console.log('Usage: npm run generate:jwt-keys [environment]');
  console.log('Example: npm run generate:jwt-keys development');
  process.exit(1);
}

// Generate different key pairs for each environment (or single if specified)
const envsToGenerate = targetEnv ? [targetEnv] : environments;

console.log(`\n🎯 Generating keys for: ${envsToGenerate.join(', ')}`);
console.log('\n📋 RECOMMENDED APPROACH: Use Base64 encoded keys in environment files');
console.log('✅ Works with containers, cloud deployments, and CI/CD pipelines');
console.log('✅ More secure than file paths in production environments\n');

// Create keys directory
const keysDir = './keys';
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

const allKeys = {};

envsToGenerate.forEach(env => {
  console.log(`\n🔑 Generating ${env.toUpperCase()} keys...`);
  
  // Generate RS256 key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Convert to base64 for environment variables
  const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

  // Store for later display
  allKeys[env] = {
    privateKeyBase64,
    publicKeyBase64,
    privateKey,
    publicKey
  };

  // Save to files (backup/debugging purposes)
  fs.writeFileSync(`${keysDir}/jwt-private-${env}.pem`, privateKey);
  fs.writeFileSync(`${keysDir}/jwt-public-${env}.pem`, publicKey);
});

console.log('\n' + '='.repeat(80));
console.log('📝 COPY THESE VALUES TO YOUR ENVIRONMENT FILES');
console.log('='.repeat(80));

envsToGenerate.forEach(env => {
  const keys = allKeys[env];
  
  console.log(`\n📄 .env.${env}`);
  console.log('-'.repeat(40));
  console.log('NODE_ENV=' + env);
  
  // Set different ports per environment
  const ports = { development: 3001, testing: 3002, staging: 3003, production: 3000 };
  console.log(`PORT=${ports[env]}`);
  
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/crowdads_' + env + '?schema=public"');
  console.log('');
  console.log('# JWT Configuration');
  console.log(`JWT_PRIVATE_KEY_BASE64="${keys.privateKeyBase64}"`);
  console.log(`JWT_PUBLIC_KEY_BASE64="${keys.publicKeyBase64}"`);
  console.log('JWT_ALG=RS256');
  
  // Different expiry durations per environment
  const expiryDurations = { 
    development: '24h', 
    testing: '1h', 
    staging: '2h', 
    production: '1h' 
  };
  console.log(`EXPIRY_DURATION=${expiryDurations[env]}`);
  console.log('BCRYPT_SALT_ROUNDS=12');
});

console.log('\n' + '='.repeat(80));
console.log('💡 ALTERNATIVE: File Path Configuration (if needed)');
console.log('='.repeat(80));

envsToGenerate.forEach(env => {
  console.log(`\n📄 .env.${env} (using file paths)`);
  console.log('-'.repeat(40));
  console.log(`JWT_PRIVATE_KEY_PATH=./keys/jwt-private-${env}.pem`);
  console.log(`JWT_PUBLIC_KEY_PATH=./keys/jwt-public-${env}.pem`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ Key files saved to ./keys/ directory (gitignored)');
console.log('✅ Each environment has unique key pairs for security');
console.log('🚀 Ready to start your application!');
console.log('='.repeat(80));
