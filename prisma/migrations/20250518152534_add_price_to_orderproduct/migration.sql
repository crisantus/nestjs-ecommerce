/*
  Warnings:

  - Added the required column `price` to the `order_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order_products` ADD COLUMN `price` DECIMAL(65, 30) NOT NULL;
