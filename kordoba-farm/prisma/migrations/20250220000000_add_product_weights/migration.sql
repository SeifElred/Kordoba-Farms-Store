-- CreateTable
CREATE TABLE `ProductWeight` (
    `id` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductWeight_productType_idx`(`productType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
