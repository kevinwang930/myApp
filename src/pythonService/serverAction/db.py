from sqlalchemy import create_engine,text
from pathlib import Path
import logging
import os
dbPath = Path(os.getenv('DATABASE_PATH')).resolve()
logging.debug(f"sqlite database file path {dbPath}")
engine = create_engine(f'sqlite:///{str(dbPath)}')

class Order:
    pass

def dbTest():
    with engine.connect() as conn:
        result = conn.execute(text('select name from sqlite_master where type="table";')).all()
        logging.debug(result)


        # return result[0]['id']
def getOrder_db(orderNo):
    with engine.connect() as conn:
        orderInfo = conn.execute(text(f'select id,orderNo,supplierId from orders where orderNo = "{orderNo}"')).first()
        if orderInfo.id:
            supplier = conn.execute(text(f'select id,name,address,contact,telephone,cellphone from suppliers where id = "{orderInfo.supplierId}"')).first()
            orderItems = conn.execute(text(f'select productNo,productName,description,price,quantity from orderItems where orderId = "{orderInfo.id}"')).all()
         
            order = Order()
            order.orderInfo = orderInfo
            order.supplier = supplier
            order.orderItems = orderItems
            return order
        else:
            return False

def getSupplier_db(supplierId):
    with engine.connect() as conn:
        supplier = conn.execute(text(f'select id,name,address,contact,telephone,cellphone from suppliers where id = "{supplierId}"')).first()
        if supplier:
            return supplier
        else :
            return False





if __name__ == "__main__":
    with engine.connect() as conn:
        result = conn.execute(text(f'SELECT name FROM sqlite_master WHERE type="table";'))
        print(result.all())
    # getOrderInfoFromDbWithOrderNo('01')
    