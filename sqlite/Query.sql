SELECT * FROM sqlite_temp_master;
PRAGMA data_version;
SELECT changes();

USE orders;
INSERT INTO products (name,description,supplierId) values ("水杯","水杯",1) RETURNING id;
delete from orders where description = "order - 1616569931390" returning *;

SELECT orders.orderNo,sum(orderItems.quantity*orderItems.price) AS productAmountPerOrder
	FROM orderItems JOIN orders ON orderItems.orderId = orders.id
	WHERE orderItems.productId = 1
	GROUP BY orders.id;

INSERT INTO item(orgId,itemNo) VALUES (4,"005") returning *;	
INSERT INTO products(productNo,name,supplierId) values ("005","水杯",1) returning *;
	
	
ALTER TABLE orderItems rename COLUMN requirement TO description;

ALTER TABLE orderItems ADD COLUMN productNo VARCHAR(255) NOT NULL ;

ROLLBACK;

SELECT * FROM "order".pragma_table_info('orderItems');
SELECT * FROM "order".sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
SELECT * FROM sqlite_master WHERE type='table';


SELECT sqlite_version();

PRAGMA foreign_keys;

CREATE TABLE IF NOT EXISTS suppliers (
id INTEGER PRIMARY KEY AUTOINCREMENT,
`name` VARCHAR(255) NOT NULL UNIQUE,
`address` VARCHAR(255),
`contact` VARCHAR(255),
`telephone` VARCHAR(255),
`cellphone` VARCHAR(255),
`createdAt` DATETIME NOT NULL DEFAULT DATETIME('now'),
`updatedAt` DATETIME NOT NULL DEFAULT DATETIME('now')
);


CREATE TABLE IF NOT EXISTS  suppliers (
id INTEGER PRIMARY KEY AUTOINCREMENT,
`name` VARCHAR(255) NOT NULL UNIQUE,
`address` VARCHAR(255),
`contact` VARCHAR(255),
`telephone` VARCHAR(255),
`cellphone` VARCHAR(255),
`createdAt` DATETIME NOT NULL DEFAULT (DATETIME('now')),
`updatedAt` DATETIME NOT NULL DEFAULT (DATETIME('now'))
);