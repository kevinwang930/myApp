import sqlite3
from pathlib import Path
import logging
import os
from .setting import getSqliteFilePath

sqlitePath = None
connection = None


def sqliteConnect():
    global connection, sqlitePath
    currentSqliteFilePath = getSqliteFilePath()
    if not currentSqliteFilePath:
        return False
    if connection:
        if currentSqliteFilePath == sqlitePath:
            return True
        else:
            connection.close()
            sqlitePath = currentSqliteFilePath
            connection = sqlite3.connect(sqlitePath)
            connection.row_factory = sqlite3.Row
            return True
    else:
        sqlitePath = currentSqliteFilePath
        connection = sqlite3.connect(sqlitePath)
        connection.row_factory = sqlite3.Row
        return True


def sqliteDisconnect():
    global connection
    if connection:
        connection.close()
    logging.debug("python sqlite disconnected")


class Order:
    pass


def getOrder_db(orderNo):
    cur = connection.cursor()
    cur.execute(f'select id,orderNo,supplierId from orders where orderNo = "{orderNo}"')
    orderInfo = cur.fetchone()
    if orderInfo["id"]:
        cur.execute(
            f'select id,name,address,contact,telephone,cellphone from suppliers where id = "{orderInfo["supplierId"]}"'
        )
        supplier = cur.fetchone()
        cur.execute(
            f'select productNo,productName,description,price,quantity from orderItems where orderId = "{orderInfo["id"]}"'
        )
        orderItems = cur.fetchall()
        order = Order()
        order.orderInfo = orderInfo
        order.supplier = supplier
        order.orderItems = orderItems
        return order
    else:
        return False


def getSupplier_db(supplierId):
    cur = connection.cursor()
    cur.execute(
        f'select id,name,address,contact,telephone,cellphone from suppliers where id = "{supplierId}"'
    )
    supplier = cur.fetchone()
    if supplier:
        return supplier
    else:
        return False
