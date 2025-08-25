-- CreateTable
CREATE TABLE "public"."influencers" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "profilePictureUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beats" (
    "id" SERIAL NOT NULL,
    "caption" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "statusKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "influencerId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,

    CONSTRAINT "beats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_platforms" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "numberOfFollowers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "influencerId" INTEGER NOT NULL,

    CONSTRAINT "social_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "influencers_username_key" ON "public"."influencers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_email_key" ON "public"."influencers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "social_platforms_influencerId_key_key" ON "public"."social_platforms"("influencerId", "key");

-- AddForeignKey
ALTER TABLE "public"."beats" ADD CONSTRAINT "beats_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beats" ADD CONSTRAINT "beats_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_platforms" ADD CONSTRAINT "social_platforms_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
