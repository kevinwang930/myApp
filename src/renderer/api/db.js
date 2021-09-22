import Database from 'better-sqlite3'
import {exec, execSync} from 'child_process'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {log} from './log'

const dbPath = process.env.SQLITE_PATH
const dumpPath = process.env.DATABASE_DUMPPATH

let db = null

let dataVersion

const simpleOption = {simple: true} //  first colum of first row

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
    dataVersion = db.pragma('data_version', {simple: true})
    return dataVersion
}

export function dbConnect() {
    if (!db) {
        db = new Database(dbPath, {
            fileMustExist: true,
            verbose: log.debug,
        })
    }

    getDataVersion()
    db.pragma('foreign_keys=on')
    const result = db.pragma('foreign_keys', simpleOption)

    log.debug('database connected.')
    log.debug('foreign key status', result)
}

export function dbClose() {
    db.close()
    db = null
}

export async function getSqliteVersion() {
    const stmt = db.prepare('select sqlite_version() as version')
    return stmt.get().version
}

export function getForeignKeyStatus() {
    return db.pragma('foreign_keys', {simple: true})
}

export function checkDataVersion() {
    const version = db.pragma('data_version', {simple: true})
    if (dataVersion === version) {
        return true
    }
    dataVersion = version
    return false
}

export const getOrderTotalAmount = async (id) => {
    try {
        const result = db
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
        return result.totalAmount
    } catch (e) {
        log.error('get total amount failed', e.message)
        return Promise.reject(e.message)
    }
}

export async function checkSupplierNameDuplicate(name) {
    const result = db
        .prepare(`select id from suppliers where name = '${name}'`)
        .get()
    if (result) return true
    return false
}

export function checkProductNoExistInSupplier(supplierId, productNo) {
    const result = db
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
    const result = db
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
        stmt = db.prepare(`
		select ${select} from ${tableName}
			${condition}
	    `)
    } else {
        stmt = db.prepare(`
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
    const result = db
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
        const suppliers = db
            .prepare(
                `select id,name,address,contact,cellPhone,telephone from suppliers`
            )
            .all()
        // let suppliersText = suppliers.map(supplier => supplier.toJSON())
        // log.debug('get suppliers from db',suppliersText)
        return suppliers
    } catch (error) {
        log.error('failed to get suppliers', error.message)
        return Promise.reject(error)
    }
}

export function getOrders() {
    try {
        const resultArray = db
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
        log.error('failed to get orders', error.message)
        return Promise.reject(error)
    }
}

export const getOrderItems = () => {
    try {
        const orderItems = db
            .prepare(
                `select id,orderId,productId,productNo,productName,description,price,quantity
		from orderItems
		`
            )
            .all()
        return orderItems
    } catch (e) {
        log.error('failed to get orderItems', e.message)
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
        log.error('failed to get products', error)
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
        const supplierProducts = db
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

    const stmt = db.prepare(`
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
        db.prepare(
            `
		delete from ${tableName} where id = ${id}
		`
        ).run()
    } catch (e) {
        log.debug(`delete from ${tableName} failed`, e.message)
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
        const row = db
            .prepare(
                `
		insert into ${tableName} (${columns.join()},createdAt,updatedAt)
		values(${values.join()},datetime('now'),datetime('now')) returning id`
            )
            .get()
        log.debug(`insert database ${tableName} id ${row.id}`)
        info.id = row.id
    } catch (e) {
        log.error('insert entry failed', e.message)
        return Promise.reject(e)
    }
}

export const insertSupplier = (info) => insertEntry('suppliers', info)
export const insertProduct = (info) => insertEntry('products', info)
export const insertOrder = (info) => insertEntry('orders', info)
export const insertOrderItem = (info) => insertEntry('orderItems', info)

export function insertEntries(tableName, infoList) {
    const insertMany = db.transaction(() => {
        for (let n = 0; n < infoList.length; n += 1) {
            const info = infoList[n]
            insertEntry(tableName, info)
        }
    })

    try {
        insertMany(infoList)
    } catch (e) {
        log.error('insertEntries failed', e.message)
        return Promise.reject(e)
    }
}

export const insertProducts = (infoList) => insertEntries('products', infoList)

export async function createOrder({orderInfo, orderItemsInfo}) {
    const createFn = db.transaction(() => {
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
        log.error('create order failed', e.message)
        return Promise.reject(e)
    }
}

export function sqlite_dump(filePath, callback) {
    const dumpDir = path.dirname(filePath)
    if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir, {recursive: true})
    }
    exec(
        `sqlite3 ${dbPath} .dump | ForEach-Object {$_.replace("CREATE TABLE","CREATE TABLE IF NOT EXISTS")} > ${filePath}`,
        {
            shell: 'pwsh',
        },
        callback
    )
}

export function sqlite_reset() {
    try {
        dbClose()
    } catch (e) {
        log.error(e.message)
    }

    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath)
    }

    execSync(`sqlite3 ${dbPath} ".exit"`)
    dbConnect()
}

export function sqlite_resetAndLoadSchema() {
    try {
        dbClose()
    } catch (e) {
        log.error(e.message)
    }

    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath)
    }
    const buffer = execSync(
        `sqlite3 ${dbPath} ".read ${process.env.DATABASE_SCHEMAPATH}" ".exit"`
    )
    log.info(buffer.toString())
    dbConnect()
}

export function sqlite_readDump(filePath) {
    const buffer = execSync(`sqlite3 ${dbPath} ".read '${filePath}'" ".exit"`)
    log.info(buffer.toString())
}
