import Database from 'better-sqlite3'
import {execSync} from 'child_process'
import path from 'path'
import {existsSync, unlinkSync, copyFileSync} from 'fs'
import date from 'date-and-time'
import {sqliteLog} from '../log'
import {
    getSqliteFilePath,
    getSqliteSchemaPath,
    getSqliteDumpPath,
    setSqlitePath,
    getSqliteBackupPath,
} from '../../bridges/settings'

let connection = null
let dataVersion

// const simpleOption = {simple: true} //  first colum of first row

const prepareValueToDB = (value) => {
    if (typeof value === 'string' || value instanceof String) {
        return `'${value}'`
    }
    if (value === null) {
        return 'null'
    }
    if (value === true) {
        return 1
    }
    if (value === false) {
        return 0
    }
    return value
}

export function getDataVersion() {
    dataVersion = connection.pragma('data_version', {simple: true})
    return dataVersion
}

export function sqlite_initConnect() {
    const sqliteFilePath = getSqliteFilePath()

    if (!existsSync(sqliteFilePath)) {
        const schemaPath = getSqliteSchemaPath()
        sqlite_createLoadSchema(sqliteFilePath, schemaPath)
    }

    sqlite_connect(sqliteFilePath)
}

export function sqlite_connect(filePath = null) {
    let sqliteFilePath
    if (filePath) {
        sqliteFilePath = filePath
    } else {
        sqliteFilePath = getSqliteFilePath()
    }

    if (!connection) {
        connection = new Database(sqliteFilePath, {
            fileMustExist: true,
            verbose: sqliteLog.debug,
        })
        sqliteLog.debug(`sqlite connected ${sqliteFilePath}`)
    } else {
        sqliteLog.warn(`${connection.name} already opened`)
    }

    getDataVersion()
    connection.pragma('foreign_keys=on')
}

export function sqlite_disconnect() {
    if (connection) {
        connection.close()
        connection = null
        sqliteLog.debug('sqlite closed')
    }
}

export function sqlite_changePath(newPath) {
    sqlite_disconnect()
    const oldSqliteFilePath = getSqliteFilePath()
    setSqlitePath(newPath)
    const newSqliteFilePath = getSqliteFilePath()
    if (!existsSync(newSqliteFilePath)) {
        copyFileSync(oldSqliteFilePath, newSqliteFilePath)
    }
    sqlite_connect(newSqliteFilePath)
}

export async function getSqliteVersion() {
    const stmt = connection.prepare('select sqlite_version() as version')
    return stmt.get().version
}

export function getForeignKeyStatus() {
    return connection.pragma('foreign_keys', {simple: true})
}

export function checkDataVersion() {
    const version = connection.pragma('data_version', {simple: true})
    if (dataVersion === version) {
        return true
    }
    dataVersion = version
    return false
}

export const getOrderTotalAmount = async (id) => {
    try {
        const result = connection
            .prepare(
                `
		select sum(price*quantity) as totalAmount
		from orders
			join orderitems on orderId = orders.id
			where orders.id = '${id}'
			group by orders.id
		`
            )
            .get()
        if (!result) {
            return 0
        }
        return result.totalAmount
    } catch (e) {
        sqliteLog.error('get total amount failed', e.message)
        return Promise.reject(e.message)
    }
}

export async function checkSupplierNameDuplicate(name) {
    const result = connection
        .prepare(`select id from suppliers where name = '${name}'`)
        .get()
    if (result) return true
    return false
}

export function checkProductNoExistInSupplier(supplierId, productNo) {
    const result = connection
        .prepare(
            `
		select * from products
		where supplierId = ${supplierId} and productNo = '${productNo}'
	`
        )
        .get()

    if (result) {
        return true
    }
    return false
}
export const selectEntry = (tableName, select, condition) => {
    const result = connection
        .prepare(
            `
		select ${select} from ${tableName}
			where ${condition}
	`
        )
        .get()
    return result
}

export const selectMultipleEntries = (tableName, select, condition) => {
    let stmt
    if (condition) {
        stmt = connection.prepare(`
		select ${select} from ${tableName}
			${condition}
	    `)
    } else {
        stmt = connection.prepare(`
		select ${select} from ${tableName}
	    `)
    }
    const results = stmt.all()
    return results
}
export function getProductIdsAndOrderIdsBySupplierId(id) {
    // let sameDataVersion = await checkDataVersion()
    let result
    let productIds
    let orderIds
    result = selectEntry(
        'products',
        `group_concat(id) as ids`,
        `supplierId = ${id}`
    )
    if (result.ids) {
        productIds = result.ids.split(',').map((idString) => parseInt(idString))
    } else {
        productIds = []
    }

    result = selectEntry(
        'orders',
        `group_concat(id) as ids`,
        `supplierId = ${id}`
    )
    if (result.ids) {
        orderIds = result.ids.split(',').map((idString) => parseInt(idString))
    } else {
        orderIds = []
    }
    return [productIds, orderIds]
}

export const selectCount = (tablename, condition) => {
    const result = connection
        .prepare(
            `
		select count(*) as count from ${tablename}
			where ${condition}
		`
        )
        .get()
    return result.count
}

export function getSuppliers() {
    try {
        const suppliers = connection
            .prepare(
                `select id,name,address,contact,cellPhone,telephone from suppliers`
            )
            .all()
        // let suppliersText = suppliers.map(supplier => supplier.toJSON())
        // log.debug('get suppliers from db',suppliersText)
        return suppliers
    } catch (error) {
        sqliteLog.error('failed to get suppliers', error.message)
        return Promise.reject(error)
    }
}

export function getOrders() {
    try {
        const resultArray = connection
            .prepare(
                `
		select orders.id,orderNo,supplierId,
		sum(price*quantity) as totalAmount,
		group_concat(orderItems.id) as orderItemIds
		from orders
			left join orderitems on orderId = orders.id
			group by orders.id

		`
            )
            .all()
        return resultArray.map((order) => {
            let orderItemIds
            let totalAmount
            if (order.orderItemIds) {
                orderItemIds = order.orderItemIds
                    .split(',')
                    .map((idString) => parseInt(idString))
            } else {
                orderItemIds = []
            }

            if (!order.totalAmount) {
                totalAmount = 0
            } else {
                totalAmount = order.totalAmount
            }
            return {
                ...order,
                orderItemIds,
                totalAmount,
            }
        })
    } catch (error) {
        sqliteLog.error('failed to get orders', error.message)
        return Promise.reject(error)
    }
}

export const getOrderItems = () => {
    try {
        const orderItems = connection
            .prepare(
                `select id,orderId,productId,productNo,productName,description,price,quantity
		from orderItems
		`
            )
            .all()
        return orderItems
    } catch (e) {
        sqliteLog.error('failed to get orderItems', e.message)
        return Promise.reject(e)
    }
}

export async function getProducts() {
    try {
        const products = await selectMultipleEntries(
            'products',
            'id,name,productNo,description,supplierId',
            ''
        )
        // Product.findAll({ attributes: ['id', 'name', 'productNo', 'description','supplierId'] })
        return products
    } catch (error) {
        sqliteLog.error('failed to get products', error)
        return Promise.reject(error)
    }
}

export function checkOrderNoExist(value) {
    const result = selectEntry('orders', '*', `orderNo='${value}'`)

    if (result) return true
    return false
}

export const getSupplierOrderItemsSummary = (supplierId) => {
    try {
        const supplierProducts = connection
            .prepare(
                `
			select productNo,productName,(productNo || '-' || productName) as productLabel, sum(price*quantity) as amount from orderItems
			where orderId in
				(select id from orders where supplierId = ${supplierId})
			group by productId
		`
            )
            .all()
        return supplierProducts.sort((a, b) => a.amount - b.amount)
    } catch (e) {
        return Promise.reject(e)
    }
}

export const updateEntryById = (tableName, id, changes) => {
    const setContent = []
    for (const [key, value] of Object.entries(changes)) {
        const preparedValue = prepareValueToDB(value)
        setContent.push(`${key} = ${preparedValue}`)
    }

    const stmt = connection.prepare(`
	update ${tableName}
	set ${setContent.join()}
	where id = ${id}
	`)
    stmt.run()
}

export const updateSupplierById = (id, changes) =>
    updateEntryById('suppliers', id, changes)
export const updateProductById = (id, changes) =>
    updateEntryById('products', id, changes)
export const updateOrderById = (id, changes) =>
    updateEntryById('orders', id, changes)
export const updateOrderItemById = (id, changes) =>
    updateEntryById('orderItems', id, changes)

export const deleteEntryById = async (tableName, id) => {
    try {
        connection
            .prepare(
                `
		delete from ${tableName} where id = ${id}
		`
            )
            .run()
    } catch (e) {
        sqliteLog.debug(`delete from ${tableName} failed`, e.message)
        return Promise.reject(e)
    }
}

export const deleteSupplierById = (id, changes) =>
    deleteEntryById('suppliers', id, changes)
export const deleteProductById = (id, changes) =>
    deleteEntryById('products', id, changes)
export const deleteOrderById = (id, changes) =>
    deleteEntryById('orders', id, changes)
export const deleteOrderItemById = (id, changes) =>
    deleteEntryById('orderItems', id, changes)

export function insertEntry(tableName, info) {
    const columns = []
    const values = []
    for (const [key, value] of Object.entries(info)) {
        const preparedValue = prepareValueToDB(value)
        columns.push(key)
        values.push(preparedValue)
    }
    try {
        const row = connection
            .prepare(
                `
		insert into ${tableName} (${columns.join()},createdAt,updatedAt)
		values(${values.join()},datetime('now'),datetime('now')) returning id`
            )
            .get()
        sqliteLog.debug(`insert database ${tableName} id ${row.id}`)
        info.id = row.id
    } catch (e) {
        sqliteLog.error('insert entry failed', e.message)
        return Promise.reject(e)
    }
}

export const insertSupplier = (info) => insertEntry('suppliers', info)
export const insertProduct = (info) => insertEntry('products', info)
export const insertOrder = (info) => insertEntry('orders', info)
export const insertOrderItem = (info) => insertEntry('orderItems', info)

export function insertEntries(tableName, infoList) {
    const insertMany = connection.transaction(() => {
        for (let n = 0; n < infoList.length; n += 1) {
            const info = infoList[n]
            insertEntry(tableName, info)
        }
    })

    try {
        insertMany(infoList)
    } catch (e) {
        sqliteLog.error('insertEntries failed', e.message)
        return Promise.reject(e)
    }
}

export const insertProducts = (infoList) => insertEntries('products', infoList)

export async function createOrder({orderInfo, orderItemsInfo}) {
    const createFn = connection.transaction(() => {
        insertEntry('orders', orderInfo)

        orderInfo.orderItemIds = []
        for (let n = 0; n < orderItemsInfo.length; n += 1) {
            const info = orderItemsInfo[n]
            info.orderId = orderInfo.id
            insertEntry('orderItems', info)

            orderInfo.orderItemIds.push(info.id)
        }
    })

    try {
        createFn()
    } catch (e) {
        sqliteLog.error('create order failed', e.message)
        return Promise.reject(e)
    }
}

export function sqlite_dump() {
    const dumpPath = getSqliteDumpPath()
    const sqliteFilePath = getSqliteFilePath()
    const now = new Date()
    const timeStamp = date.format(now, 'YYYY-MM-DD-HH-mm-ss')
    const fileName = `${path.basename(
        sqliteFilePath,
        '.sqlite'
    )}.dump.${timeStamp}.sql`
    const dumpFilePath = path.resolve(dumpPath, fileName)
    execSync(
        `sqlite3 ${sqliteFilePath} .dump | ForEach-Object {$_.replace("CREATE TABLE","CREATE TABLE IF NOT EXISTS")} > ${dumpFilePath}`,
        {
            shell: 'pwsh',
        }
    )
}

export function sqlite_reset() {
    sqlite_disconnect()
    const sqliteFilePath = getSqliteFilePath()
    const schemaPath = getSqliteSchemaPath()

    if (existsSync(sqliteFilePath)) {
        unlinkSync(sqliteFilePath)
    }

    execSync(`sqlite3 ${sqliteFilePath} ".read '${schemaPath}'" ".exit"`)
    sqlite_connect(sqliteFilePath)
}

export function sqlite_readDump(dumpPath) {
    const sqliteFilePath = getSqliteFilePath()
    const buffer = execSync(
        `sqlite3 ${sqliteFilePath} ".read '${dumpPath}'" ".exit"`
    )
    sqliteLog.info(buffer.toString())
    sqliteLog.debug('dump finished')
}

export function sqlite_backup() {
    const sqliteFilePath = getSqliteFilePath()
    const sqliteBackupPath = getSqliteBackupPath()
    const now = new Date()
    const timeStamp = date.format(now, 'YYYY-MM-DD-HH-mm-ss')
    const fileName = `${path.basename(
        sqliteFilePath,
        '.sqlite'
    )}.backup.${timeStamp}.sqlite`
    const backupFilePath = path.resolve(sqliteBackupPath, fileName)
    execSync(`sqlite3 ${sqliteFilePath} ".backup '${backupFilePath}'" ".exit"`)
    return {result: true, path: backupFilePath}
}

export function sqlite_createLoadSchema(sqliteFilePath, schemaPath) {
    execSync(`sqlite3 ${sqliteFilePath} ".read '${schemaPath}'" ".exit"`)
}
