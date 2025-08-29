/*
  Warnings:

  - The primary key for the `AttributeValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `attributeId` on the `AttributeValue` table. All the data in the column will be lost.
  - The `id` column on the `AttributeValue` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `variantId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the `Attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantAttribute` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productAttributeId` to the `AttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AttributeValue" DROP CONSTRAINT "AttributeValue_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CartItem" DROP CONSTRAINT "CartItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantAttribute" DROP CONSTRAINT "VariantAttribute_attributeValueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantAttribute" DROP CONSTRAINT "VariantAttribute_variantId_fkey";

-- AlterTable
ALTER TABLE "public"."AttributeValue" DROP CONSTRAINT "AttributeValue_pkey",
DROP COLUMN "attributeId",
ADD COLUMN     "productAttributeId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AttributeValue_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."CartItem" DROP COLUMN "variantId",
ADD COLUMN     "productVariationId" INTEGER;

-- DropTable
DROP TABLE "public"."Attribute";

-- DropTable
DROP TABLE "public"."Variant";

-- DropTable
DROP TABLE "public"."VariantAttribute";

-- CreateTable
CREATE TABLE "public"."ProductAttribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariation" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariationAttribute" (
    "id" SERIAL NOT NULL,
    "attributeValueId" INTEGER NOT NULL,
    "productVariationId" INTEGER NOT NULL,

    CONSTRAINT "VariationAttribute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProductAttribute" ADD CONSTRAINT "ProductAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttributeValue" ADD CONSTRAINT "AttributeValue_productAttributeId_fkey" FOREIGN KEY ("productAttributeId") REFERENCES "public"."ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariationAttribute" ADD CONSTRAINT "VariationAttribute_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "public"."AttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariationAttribute" ADD CONSTRAINT "VariationAttribute_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "public"."ProductVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "public"."ProductVariation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
