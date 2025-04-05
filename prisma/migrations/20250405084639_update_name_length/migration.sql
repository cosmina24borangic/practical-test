/*
  Warnings:

  - You are about to alter the column `name` on the `category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `name` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `name` on the `tag` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `category` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `tag` MODIFY `name` VARCHAR(50) NOT NULL;
