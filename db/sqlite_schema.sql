CREATE TABLE IF NOT EXISTS `suppliers` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `name` VARCHAR(255) NOT NULL UNIQUE,
        `address` VARCHAR(255),
        `contact` VARCHAR(255),
        `telephone` VARCHAR(255),
        `cellphone` VARCHAR(255),
        -- default function need to add ()
        `createdAt` DATETIME NOT NULL DEFAULT (DATETIME('now')), 
        `updatedAt` DATETIME NOT NULL DEFAULT (DATETIME('now'))
);

CREATE TABLE if not EXISTS `orders` (
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

CREATE TABLE if not EXISTS `products` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `productNo` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `description` VARCHAR(255),
        `supplierId` INTEGER NOT NULL REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        `createdAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
        `updatedAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
        UNIQUE (`productNo`, `supplierId`)
);

CREATE TABLE `orderItems` (
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