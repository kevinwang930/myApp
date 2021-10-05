create database if not EXISTS `orderDB`;
USE `orderDB`;
SET GLOBAL sql_mode = 'EMPTY_STRING_IS_NULL';

create TABLE if not exists supplier (
    `supplierNo`        SMALLINT			UNSIGNED 	NOT NULL        auto_increment,
    `englishname`              VARCHAR(80)     NOT NULL    UNIQUE,
    `chinesename`               VARCHAR(40)     NOT NULL    UNIQUE,
    `address`           VARCHAR(100),
    `paymentTerms`      VARCHAR(40),
    primary key (`supplierNo`)
);

create TABLE if not exists supplierContact (
    `supplierNo`        SMALLINT    UNSIGNED    DEFAULT  null,
    `contactNo`         SMALLINT    UNSIGNED 	AUTO_INCREMENT,
    `name`              varchar(40)     not null,
    `phone`             varchar(40)     default null    UNIQUE,
    `email`             VARCHAR(40)     default null    UNIQUE,
    `from_date`         DATE        DEFAULT     CURRENT_DATE(),
    `to_date`           DATE 		DEFAULT     NULL,
    PRIMARY KEY(`contactNo`),
    foreign KEY(`supplierNo`) REFERENCES `supplier` (`supplierNo`) ON DELETE SET DEFAULT ON UPDATE CASCADE,
    UNIQUE KEY(`supplierNo`,`name`)

);




create TABLE if not exists bankAccount (
    `bankAccountNo`     SMALLINT			UNSIGNED			AUTO_INCREMENT 	not null,
    `supplierNo`        smallint        unsigned            not null,    
    `bankName`          VARCHAR(40)     NOT null,
    `bankBranchName`    VARCHAR(40)     NOT NULL,
    `ownerName`         VARCHAR(20)     NOT NULL,
    `account`           VARCHAR(20)     NOT NULL        UNIQUE,
    primary key (`bankAccountNo`),
    foreign KEY (`supplierNo`)  REFERENCES `supplier` (`supplierNo`) ON DELETE CASCADE ON UPDATE CASCADE
);



create TABLE if not EXISTS `order` (
    `orderNo`          SMALLINT 		UNSIGNED  	NOT NULL,
    `supplierNo`       SMALLINT        UNSIGNED    not null,
    `date`              date           DEFAULT CURRENT_DATE,
    `qty`               INT              UNSIGNED,
    `volume`            SMALLINT        UNSIGNED,
    `grossWeight`       INT              UNSIGNED,
    `netWeight`         INT              UNSIGNED,
    `amount`           INT              UNSIGNED,
    `paymentMethod`     VARCHAR(40),
    `deliveryTerms`     VARCHAR(40),
    primary key (`orderNo`),
    foreign key (`supplierNo`) REFERENCES `supplier` (`supplierNo`) on delete cascade on update cascade
);
create TABLE IF NOT EXISTS `item` (
    `itemNo`            INT       	    UNSIGNED 	not NULL	AUTO_INCREMENT ,
    `supplierNo`        SMALLINT        UNSIGNED      not null,
    `supplierItemNo`    VARCHAR(20)		NOT NULL,
    `name`              VARCHAR(40)     not null,
    `from_date`         date            not null,
    `to_date`           date,
    `detail`            varchar(255),
    `material`          varchar(255),
    `hscode`            int(6)          zerofill        not null,
    `brand`             varchar(40),
    `netWeight`         int,
    `grossWeight`       int,
    primary key (`itemNo`),
    foreign key (`supplierNo`) REFERENCES `supplier` (`supplierNo`) on delete cascade on update cascade

);

create TABLE IF NOT EXISTS orderItem (
	`orderItemNo` 	SMALLINT 		UNSIGNED    NOT NULL,
    `orderNo`       SMALLINT        UNSIGNED    NOT NULL,  
    `itemNo`        INT 	        UNSIGNED    not NULL,   
    `itemQty`       int             UNSIGNED    NOT NULL,
    `unitPrice`     INT             UNSIGNED    NOT NULL,
    `amount`        int             UNSIGNED    NOT NULL,
    `detail`        VARCHAR(40),
    primary KEY (`orderNo`,`orderItemNo`),
    foreign key (`orderNo`) REFERENCES `order` (`orderNo`) on delete cascade   on update CASCADE,
    foreign key (`itemNo`) REFERENCES `item` (`itemNo`) on delete restrict  on update cascade

);

create TABLE IF NOT EXISTS orderPackage (
	 `packageNo`         INT 	        UNSIGNED        NOT NULL    AUTO_INCREMENT ,
    `orderNo`           SMALLINT        UNSIGNED        NOT NULL,   
    `itemQtyPerCarton`  SMALLINT        UNSIGNED        NOT NULL,
    `cartonSize`        VARCHAR(40),
    `volume`            SMALLINT        UNSIGNED,
    `grossWeight`       SMALLINT        UNSIGNED,
    `packageQty`        SMALLINT        UNSIGNED        NOT NULL,
    primary key (`packageNo`),
    foreign key (`orderNo`) REFERENCES `order` (`orderNo`) on delete cascade on update cascade
    


);


create TABLE IF NOT EXISTS packageDetails (
    `orderNo`           SMALLINT        unsigned        NOT NULL,
    `packageNo`         INT 			UNSIGNED		NOT NULL,
    `packageDetailsNo`  SMALLINT        UNSIGNED        NOT NULL,
    `itemNo`            INT             UNSIGNED        not null,
    `itemQty`           SMALLINT        UNSIGNED        NOT NULL,
    primary key (`packageNo`,`packageDetailsNo`),
    foreign key (`orderNo`)   REFERENCES `order` (`orderNo`)  on delete cascade   on update cascade,
    foreign key (`packageNo`)  REFERENCES `orderPackage` (`packageNo`) on delete cascade   on update cascade,
    FOREIGN KEY (`itemNo`) REFERENCES `item` (`itemNo`) ON DELETE RESTRICT ON UPDATE cascade

);