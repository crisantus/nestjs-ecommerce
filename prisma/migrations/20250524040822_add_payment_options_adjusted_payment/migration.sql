/*
  Warnings:

  - You are about to drop the column `description` on the `PaymentOption` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PaymentOption` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `PaymentOption_name_key` ON `PaymentOption`;

-- AlterTable
ALTER TABLE `PaymentOption` DROP COLUMN `description`,
    DROP COLUMN `isActive`;
