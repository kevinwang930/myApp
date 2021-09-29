import sqlite3
from pathlib import Path
import logging
import os
from .setting import getSqlitePath

sqlitePath = None
connection = None


def sqliteConnect():
    global connection, sqlitePath
    currentSqlitePath = getSqlitePath()
    if connection:
        if currentSqlitePath == sqlitePath:
            return
        else:
            connection.close()
            sqlitePath = currentSqlitePath
            connection = sqlite3.connect(sqlitePath)
            connection.row_factory = sqlite3.Row
    else:
        sqlitePath = currentSqlitePath
        connection = sqlite3.connect(sqlitePath)
        connection.row_factory = sqlite3.Row


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


sqliteConnect()
