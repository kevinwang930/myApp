UPDATE suppliers
SET address = '龙华大浪工业园4楼',
WHERE id = 5;

 insert into suppliers (name,address,contact,cellphone,createdAt,updatedAt)
                values('小步鞋业','福建晋江','李大钊','13659845762',datetime('now'),datetime('now'));
                
BEGIN TRANSACTION;
               
insert into orders (orderNo,supplierId,createdAt,updatedAt)
                values('16','1',datetime('now'),datetime('now'));

SELECT last_insert_rowid() AS id;

ROLLBACK;

pragma foregin_keys=ON;
PRAGMA foreign_keys;
select orders.id,orderNo,supplierId,
                sum(price*quantity) as totalAmount,
                group_concat(orderItems.id) as orderItemIds
                from orders
                        left join orderitems on orderId = orders.id
                        group by orders.id;