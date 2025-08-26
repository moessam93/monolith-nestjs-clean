#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Simple Environment Switcher
 * Usage: node scripts/env.js <environment> <command>
 * Example: node scripts/env.js testing "npm run start:dev"
 */

function switchEnv() {
  const environment = process.argv[2];
  const command = process.argv[3];
  
  if (!environment || !command) {
    console.log('Usage: node scripts/env.js <environment> <command>');
    console.log('Environments: dev, testing, staging');
    console.log('Examples:');
    console.log('  node scripts/env.js testing "npm run start:dev"');
    console.log('  node scripts/env.js testing "prisma migrate dev"');
    process.exit(1);
  }
  
  // Map environment to file
  const envFiles = {
    dev: '.env.development',
    testing: '.env.testing', 
    staging: '.env.staging'
  };
  
  const envFile = envFiles[environment];
  if (!envFile) {
    console.error(`Unknown environment: ${environment}`);
    console.error('Available: dev, testing, staging');
    process.exit(1);
  }
  
  const envPath = path.resolve(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) {
    console.error(`Environment file not found: ${envFile}`);
    process.exit(1);
  }
  
  console.log(`🔄 Switching to ${environment} environment`);
  
  // Backup current .env
  const dotEnvPath = path.resolve(process.cwd(), '.env');
  const backupPath = path.resolve(process.cwd(), '.env.backup');
  
  if (fs.existsSync(dotEnvPath)) {
    fs.copyFileSync(dotEnvPath, backupPath);
  }
  
  try {
    // Copy environment file to .env
    fs.copyFileSync(envPath, dotEnvPath);
    console.log(`✅ Using ${envFile}`);
    
    // Run the command
    console.log(`🚀 Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
  } finally {
    // Restore original .env
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, dotEnvPath);
      fs.unlinkSync(backupPath);
      console.log('🔙 Restored original .env');
    }
  }
}

switchEnv();
