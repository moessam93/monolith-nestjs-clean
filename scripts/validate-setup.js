const { PrismaClient } = require('@prisma/client');

const env = process.argv[2] || 'development';
const envFile = `.env.${env}`;

// Load the specific environment file
require('dotenv').config({ path: envFile });

console.log(`🔍 Validating Prisma setup for ${env} environment...`);
console.log(`📁 Using environment file: ${envFile}`);

const prisma = new PrismaClient();

async function validateSetup() {
  try {
    console.log('🔍 Validating Prisma setup...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test schema validation by attempting to query each model
    console.log('\n📊 Testing model schemas...');
    
    // Test Influencer model with social platforms
    const influencers = await prisma.influencer.findMany({
      include: {
        socialPlatforms: true,
      },
    });
    console.log(`✅ Influencer model with social platforms - Found ${influencers.length} records`);
    
    // Test Brand model
    const brands = await prisma.brand.findMany();
    console.log(`✅ Brand model - Found ${brands.length} records`);
    
    // Test Beat model with relationships
    const beats = await prisma.beat.findMany({
      include: {
        influencer: true,
        brand: true,
      },
    });
    console.log(`✅ Beat model with relationships - Found ${beats.length} records`);
    
    // Test SocialPlatform model
    const socialPlatforms = await prisma.socialPlatform.findMany({
      include: {
        influencer: true,
      },
    });
    console.log(`✅ SocialPlatform model with relationships - Found ${socialPlatforms.length} records`);
    
    // Test relationship constraints
    console.log('\n🔗 Testing relationship constraints...');
    
    if (influencers.length > 0) {
      const influencerWithRelations = await prisma.influencer.findFirst({
        include: {
          beats: true,
          socialPlatforms: true,
        },
      });
      console.log(`✅ Influencer relationships - Beats: ${influencerWithRelations?.beats?.length || 0}, Social platforms: ${influencerWithRelations?.socialPlatforms?.length || 0}`);
    }
    
    console.log('\n🎉 All validations passed! Your Prisma setup is ready.');
    console.log('\n📝 Entity Structure:');
    console.log('📱 Influencer: username, email, nameEn, nameAr, profilePictureUrl');
    console.log('🏢 Brand: nameEn, nameAr, logoUrl, websiteUrl');
    console.log('🎬 Beat: caption, mediaUrl, thumbnailUrl, statusKey');
    console.log('📱 SocialPlatform: key, url, numberOfFollowers');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your PostgreSQL database is running');
    console.log('2. Update your .env file with the correct DATABASE_URL');
    console.log('3. Run: npm run db:push');
    console.log('4. Start the application: npm run start:dev');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    if (error.message.includes('Environment variable not found')) {
      console.log('\n💡 Tip: Make sure to create a .env file with DATABASE_URL');
    }
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Tip: Run "npm run db:push" to create database tables');
    }
  } finally {
    await prisma.$disconnect();
  }
}

validateSetup();
