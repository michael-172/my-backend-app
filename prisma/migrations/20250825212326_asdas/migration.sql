-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "price" SET DATA TYPE TEXT,
ALTER COLUMN "price_after_discount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Variant" ALTER COLUMN "price" SET DATA TYPE TEXT;
