-- First, we need to add UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add UUID columns to tables
ALTER TABLE "customers" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4();
ALTER TABLE "loan_applications" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4();
ALTER TABLE "loan_applications" ADD COLUMN "customer_uuid_id" UUID;

-- Step 2: Update foreign key in loan_applications to reference UUID
UPDATE "loan_applications" la
SET "customer_uuid_id" = c."uuid_id"
FROM "customers" c
WHERE la."customer_id" = c."id";

-- Step 3: Drop existing foreign key constraint
ALTER TABLE "loan_applications" DROP CONSTRAINT "loan_applications_customer_id_fkey";

-- Step 4: Drop primary key constraints
ALTER TABLE "customers" DROP CONSTRAINT "customers_pkey";
ALTER TABLE "loan_applications" DROP CONSTRAINT "loan_applications_pkey";

-- Step 5: Rename UUID columns to id
ALTER TABLE "customers" DROP COLUMN "id";
ALTER TABLE "customers" RENAME COLUMN "uuid_id" TO "id";

ALTER TABLE "loan_applications" DROP COLUMN "customer_id";
ALTER TABLE "loan_applications" RENAME COLUMN "customer_uuid_id" TO "customer_id";

ALTER TABLE "loan_applications" DROP COLUMN "id";
ALTER TABLE "loan_applications" RENAME COLUMN "uuid_id" TO "id";

-- Step 6: Add primary key constraints back
ALTER TABLE "customers" ADD PRIMARY KEY ("id");
ALTER TABLE "loan_applications" ADD PRIMARY KEY ("id");

-- Step 7: Add foreign key constraint back
ALTER TABLE "loan_applications"
ADD CONSTRAINT "loan_applications_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 8: Set the UUID column types
ALTER TABLE "customers" ALTER COLUMN "id" SET DATA TYPE UUID USING id::UUID;
ALTER TABLE "loan_applications" ALTER COLUMN "id" SET DATA TYPE UUID USING id::UUID;
ALTER TABLE "loan_applications" ALTER COLUMN "customer_id" SET DATA TYPE UUID USING customer_id::UUID;
