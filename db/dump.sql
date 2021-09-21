PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `suppliers` 
	(`id` INTEGER PRIMARY KEY AUTOINCREMENT, 
	`name` VARCHAR(255) NOT NULL UNIQUE, `address` VARCHAR(255), 
	`contact` VARCHAR(255), 
	`telephone` VARCHAR(255), 
	`cellphone` VARCHAR(255), 
	`createdAt` DATETIME NOT NULL, 
	`updatedAt` DATETIME NOT NULL);
INSERT INTO suppliers VALUES(1,'小河实业','深圳黄贝岭','王永','0865-235641','19925247955','2021-06-05 07:01:21.510 +00:00','2021-06-05 07:01:21.510 +00:00');
CREATE TABLE `orders` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `orderNo` VARCHAR(255) NOT NULL UNIQUE, `supplierId` INTEGER NOT NULL REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `MOD` DATE, `orderPaid` TINYINT(1) DEFAULT 0, `EDD` DATE, `ADD` DATE, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO orders VALUES(1,'01',1,NULL,0,NULL,NULL,'2021-06-05 07:11:21.749 +00:00','2021-06-05 07:11:21.749 +00:00');
INSERT INTO orders VALUES(2,'02',1,NULL,0,NULL,NULL,'2021-06-05 07:26:45.489 +00:00','2021-06-05 07:26:45.489 +00:00');
INSERT INTO orders VALUES(3,'03',1,NULL,0,NULL,NULL,'2021-06-06 01:57:24.025 +00:00','2021-06-06 01:57:24.025 +00:00');
CREATE TABLE `products` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `productNo` VARCHAR(255) NOT NULL, `name` VARCHAR(255) NOT NULL, `description` VARCHAR(255), `supplierId` INTEGER NOT NULL REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, UNIQUE (`productNo`, `supplierId`));
INSERT INTO products VALUES(1,'01','水杯300ml',NULL,1,'2021-06-05 07:02:09.460 +00:00','2021-06-05 07:02:09.460 +00:00');
INSERT INTO products VALUES(2,'02','水杯400ml',NULL,1,'2021-06-05 07:02:09.490 +00:00','2021-06-05 07:02:09.490 +00:00');
INSERT INTO products VALUES(3,'03','水杯500ml','卡通贴图',1,'2021-06-05 07:02:09.492 +00:00','2021-06-05 07:31:21.791 +00:00');
INSERT INTO products VALUES(4,'04','11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',NULL,1,'2021-06-05 08:02:23.307 +00:00','2021-06-05 08:02:23.307 +00:00');
CREATE TABLE `orderItems` (
	`id` INTEGER PRIMARY KEY AUTOINCREMENT, 
	`orderId` INTEGER NOT NULL REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
	`productId` INTEGER NOT NULL REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
	`productNo` VARCHAR(255) NOT NULL, `productName` VARCHAR(255) NOT NULL, 
	`description` VARCHAR(255), 
	`price` DECIMAL NOT NULL, 
	`quantity` DECIMAL NOT NULL, 
	`createdAt` DATETIME NOT NULL, 
	`updatedAt` DATETIME NOT NULL, 
	UNIQUE (`productNo`));
INSERT INTO orderItems VALUES(1,1,1,'01','水杯300ml',NULL,12,3000,'2021-06-05 07:11:21.781 +00:00','2021-06-05 07:26:24.101 +00:00');
INSERT INTO orderItems VALUES(2,2,3,'03','水杯500ml',NULL,13,3000,'2021-06-05 07:26:45.521 +00:00','2021-06-05 07:26:45.521 +00:00');
INSERT INTO orderItems VALUES(3,3,4,'04','11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',NULL,12,3000,'2021-06-06 01:57:24.060 +00:00','2021-06-06 01:57:24.060 +00:00');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('suppliers',1);
INSERT INTO sqlite_sequence VALUES('products',4);
INSERT INTO sqlite_sequence VALUES('orders',3);
INSERT INTO sqlite_sequence VALUES('orderItems',3);
COMMIT;
