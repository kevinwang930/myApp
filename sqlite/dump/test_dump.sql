PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS suppliers (

`x` INTEGER PRIMARY KEY ASC, y, z);
CREATE TABLE IF NOT EXISTS `orders` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `orderNo` VARCHAR(255) NOT NULL UNIQUE,
        `supplierId` INTEGER NOT NULL REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        `MOD` DATE,
        `orderPaid` TINYINT(1) DEFAULT 0,
        `EDD` DATE,
        `ADD` DATE,
        `createdAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
        `updatedAt` DATETIME NOT NULL DEFAULT (DATETIME('now'))
);
CREATE TABLE IF NOT EXISTS `products` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `productNo` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `description` VARCHAR(255),
        `supplierId` INTEGER NOT NULL REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        `createdAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
        `updatedAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
        UNIQUE (`productNo`, `supplierId`)
);
CREATE TABLE IF NOT EXISTS `orderItems` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `orderId` INTEGER NOT NULL REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        `productId` INTEGER REFERENCES `products` (`id`) ON DELETE restrict on update CASCADE,
        `productNo` VARCHAR(255) NOT NULL,
        `productName` VARCHAR(255) NOT NULL,
        `description` VARCHAR(255),
        `price` DECIMAL NOT NULL,
        `quantity` DECIMAL NOT NULL,
        `createdAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
        `updatedAt` DATETIME NOT NULL DEFAULT (DATETIME('now'))
);
DELETE FROM sqlite_sequence;
COMMIT;
