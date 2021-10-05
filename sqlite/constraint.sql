
PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

DROP TABLE if exists old_table;
ALTER TABLE orderItems rename TO old_table;

CREATE TABLE `orderItems` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT, 
	`orderId` INTEGER NOT NULL REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
	`productId` INTEGER  REFERENCES `products` (`id`) ON DELETE SET null ON UPDATE CASCADE, 
	`productNo` VARCHAR(255) NOT NULL, 
	`productName` VARCHAR(255) NOT NULL, 
	`description` VARCHAR(255), 
	`price` DECIMAL NOT NULL, 
	`quantity` DECIMAL NOT NULL, 
	`createdAt` DATETIME NOT NULL, 
	`updatedAt` DATETIME NOT NULL,
	
	 );

INSERT INTO orderItems SELECT * FROM old_table;

COMMIT;
DROP TABLE OLD_TABLE;
PRAGMA foreign_keys=on;