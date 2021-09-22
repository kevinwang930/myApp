import { Sequelize, DataTypes,QueryTypes } from 'sequelize'
import {log} from './log'
import { exec,execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'


let dbPath = process.env.DATABASE_PATH
let dumpPath = process.env.DATABASE_DUMPPATH




const rawSelectOption = {
	type:QueryTypes.SELECT,
	raw:true,
	logging:log.debug
}

const rawSingleDeleteOption = {
	type:QueryTypes.DELETE,
	raw:true,
	logging:log.debug
}

const rawSingleSelectOption = {
	type: QueryTypes.SELECT,
	raw: true,
	logging: log.debug,
	plain:true
}

const rawSingleUpdateOption = {
	type:QueryTypes.UPDATE,
	raw:true,
	logging:log.debug,
	plain:true
}

const rawSingleInsertOption = {
	type: QueryTypes.INSERT,
	raw: true,
	logging: log.debug,
	plain: true
}

let sequelize 

let dataVersion

export async function getDataVersion() {
	const results = await sequelize.query("PRAGMA data_version",{type:QueryTypes.SELECT})
	// log.debug("data version ",results)
	dataVersion = results[0].data_version

}

export async function getSqliteVersion() {
	return await sequelize.query("select sqlite_version() as version", { type: QueryTypes.SELECT })
}

export async function checkDataVersion() {
	const results = await sequelize.query("PRAGMA data_version", { type: QueryTypes.SELECT })
	if (dataVersion === results[0].data_version) {
		return true
	} else {
		dataVersion = results[0].data_version
		return false}
}

export async function dbConnect () {
	sequelize = new Sequelize({
		dialect: 'sqlite',
		storage: process.env.DATABASE_PATH,
		logging: false,
		timeZone: "+08:00"
	});
	await sequelize.authenticate()
	await sequelize.query('PRAGMA foreign_keys=on;')
	let result = sequelize.query('PRAGMA foreign_keys;')
	log.debug('foreign key status', result)
	log.debug('database connected.');
}
export async function dbReconnect() {
	try {
		await sequelize.authenticate();
		await sequelize.query('PRAGMA foreign_keys=on;')
		log.debug('database connected.');
	} catch (e) {
		log.debug('try to reconnect database');
		
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: process.env.DATABASE_PATH,
			logging: false,
			timeZone: "+08:00"
		});			
		await sequelize.authenticate();
		await getDataVersion()
		await sequelize.query('PRAGMA foreign_keys=on;')
		log.debug('database connected.');


		
	}
	
}

export async function dbClose() {
	try {
		// await sequelize.connectionManager.connections.default.close();
		await sequelize.close()
		log.debug('sqlite closed successfully.');
	} catch (error) {
		throw new Error(`Unable to close sqlite: ${error}`);
	}
}

export async function testConnect() {
	try {
		await sequelize.authenticate();
		log.debug('Connection has been established successfully.');
	} catch (error) {
		log.error('Unable to connect to the database:', error);
	}
}






export const getOrderTotalAmount = async (id) => {
	try {
		let result =  await sequelize.query(`
		select sum(price*quantity) as totalAmount
		from orders 
			join orderitems on orderId = orders.id
			where orders.id = :id	
			group by orders.id
		`, {
			type: QueryTypes.SELECT,
			replacements: { id: id }
		})
		return result[0].totalAmount
	} catch(e) {
		return Promise.reject(e.message)
	}
	
}

export async function checkSupplierNameDuplicate(name) {
	const result = await sequelize.query(`select id from suppliers where name = '${name}'`,rawSingleSelectOption)
	if (result !== null) return true
	else return false
}



export async function getProductAmountPerOrderById(productId) {
	return await sequelize.query(`
	SELECT orders.orderNo,sum(orderItems.quantity*orderItems.price) AS productAmountPerOrder
	FROM orderItems JOIN orders ON orderItems.orderId = orders.id
	WHERE orderItems.productId = ${productId}
	GROUP BY orders.id;
	`,{
		type:QueryTypes.SELECT
	})
}

export async function getProductDetailPerOrderById(productId) {
	return await sequelize.query(`
	SELECT orders.orderNo,sum(orderItems.quantity) as quantity,sum(orderItems.quantity*orderItems.price) AS productAmountPerOrder
	FROM orderItems JOIN orders ON orderItems.orderId = orders.id
	WHERE orderItems.productId = ${productId}
	GROUP BY orders.id;
	`, {
		type: QueryTypes.SELECT
	})
}

export async function checkProductNoExistInSupplier(supplierId,productNo) {
	let result = await sequelize.query(`
		select * from products 
		where supplierId = ${supplierId} and productNo = '${productNo}'
	`,rawSingleSelectOption)
	
	if (result === null) {
		return true
	} else {
		return false
	}
}


export async function getProductIdsAndOrderIdsBySupplierId(id) {
	// let sameDataVersion = await checkDataVersion()
	let productIds_string = await selectEntry('products',`group_concat(id)`,`supplierId = ${id}`)
	let productIds = productIds_string.split(',').map((idString)=>parseInt(idString))
	let orderIds_string = await selectEntry('orders', `group_concat(id)`, `supplierId = ${id}`)
	let orderIds = orderIds_string.split(',').map((idString) => parseInt(idString))
	return [productIds,orderIds]
}







export const selectCountBy = async (tablename,condition) => {
	
	let count = await sequelize.query(`
		select count(*) from ${tablename}
			where ${condition}
		`,rawSingleSelectOption)
	return count
	
}

export const selectEntry = async(tableName,select,condition) =>{
	let result = await sequelize.query(`
		select ${select} from ${tableName}
			where ${condition}
	`,rawSingleSelectOption)
	return result
}

export const selectMultipleEntries = async (tableName,select,condition)=> {
	if(!condition) condition=''
	let results = await sequelize.query(`
		select ${select} from ${tableName}
			${condition}
	`, rawSelectOption)
	return results
}

export async function getSuppliers() {
	try {
		let suppliers = await sequelize.query(`select id,name,address,contact,cellPhone,telephone from suppliers`, rawSelectOption)
		// let suppliersText = suppliers.map(supplier => supplier.toJSON())
		// log.debug('get suppliers from db',suppliersText)
		return suppliers
	} catch (error) {
		log.error('failed to get suppliers', error.message)
		return Promise.reject(error)
	}
}

export async function getOrders() {
	try {
		let resultArray = await sequelize.query(`
		select orders.id,orderNo,supplierId,
		sum(price*quantity) as totalAmount,
		group_concat(orderItems.id) as orderItemIds
		from orders 
			left join orderitems on orderId = orders.id
			group by orders.id

		`, rawSelectOption)
		return resultArray.map((order) => {
			let orderItemIds,totalAmount
			if (order.orderItemIds) {
				orderItemIds = order.orderItemIds.split(',').map((idString) => parseInt(idString))
			}else {
				orderItemIds = []
			}

			if(!order.totalAmount) {
				totalAmount = 0
			} else {
				totalAmount = order.totalAmount
			}
			return {
				...order,
				orderItemIds: orderItemIds,
				totalAmount:totalAmount
			}
		})


	} catch (error) {
		log.error('failed to get orders', error.message)
		return Promise.reject(error)
	}
}

export const getOrderItems = async () => {
	try {
		let orderItems = await sequelize.query(`select id,orderId,productId,productNo,productName,description,price,quantity
		from orderItems
		`, rawSelectOption)
		return orderItems
	} catch (e) {
		log.error('failed to get orderItems',e.message)
		return Promise.reject(e.message)
	}
}

export async function getProducts() {
	try {
		let products = await selectMultipleEntries('products', 'id,name,productNo,description,supplierId', '')
		// Product.findAll({ attributes: ['id', 'name', 'productNo', 'description','supplierId'] })
		return products
	} catch (error) {
		log.error('failed to get products', error)
		return Promise.reject(error)
	}
}

export async function checkOrderNoExist(value) {

	let result = await selectEntry('orders','*',`orderNo='${value}'`)
	
	if (result !== null) return true
	else return false
}





export const getSupplierOrderItemsSummary = async (supplierId) => {
	try {
		let supplierProducts =  await sequelize.query(`
			select productNo,productName,(productNo || '-' || productName) as productLabel, sum(price*quantity) as amount from orderItems 
			where orderId in
				(select id from orders where supplierId = ${supplierId})
			group by productId
		`,
			{ type: QueryTypes.SELECT }
		)
		return supplierProducts.sort((a,b)=>(a.amount - b.amount))
	} catch (e) {
		return Promise.reject(e.message)
	}
}

export const updateEntryById = async (tableName,id,changes)=> {
	let setContent = []
	for (const [key, value] of Object.entries(changes)) {
		let preparedValue = prepareValueToDB(value)
		setContent.push(`${key} = ${preparedValue}`)
		
		
	}

	let stmt = `
	update ${tableName}
	set ${setContent.join()}
	where id = ${id}
	`
	await sequelize.query(stmt, rawSingleUpdateOption)
}

export const updateSupplierById = (id,changes)=>updateEntryById('suppliers',id,changes)
export const updateProductById = (id, changes) => updateEntryById('products', id, changes)
export const updateOrderById = (id, changes) => updateEntryById('orders', id, changes)
export const updateOrderItemById = (id, changes) => updateEntryById('orderItems', id, changes)

export const deleteEntryById = async(tableName,id)=> {
	
	await sequelize.query(`
		delete from ${tableName} where id = ${id}
		`,rawSingleDeleteOption)	
}

export const deleteSupplierById = (id, changes) => deleteEntryById('suppliers', id, changes)
export const deleteProductById = (id, changes) => deleteEntryById('products', id, changes)
export const deleteOrderById = (id, changes) => deleteEntryById('orders', id, changes)
export const deleteOrderItemById = (id, changes) => deleteEntryById('orderItems', id, changes)

export async function insertEntry(tableName,info) {

	let columns = []
	let values = []
	for (const [key, value] of Object.entries(info)) {
		let preparedValue = prepareValueToDB(value)
		columns.push(key)
		values.push(preparedValue)
		
		
	}
	try {
		let statement = `
		insert into ${tableName} (${columns.join()},createdAt,updatedAt)
		values(${values.join()},datetime('now'),datetime('now'));`
		await sequelize.query(statement, rawSingleInsertOption)
		let row = await sequelize.query(`select last_insert_rowid() as id`, rawSingleSelectOption)
		log.debug(`insert database ${tableName} id ${row.id}`)
		info.id = row.id
	} catch(e) {
		log.error('insert entry failed',e.message)
		return Promise.reject(e)
	}
	
}

export const insertSupplier = ( info) => insertEntry('suppliers',  info)
export const insertProduct = ( info) => insertEntry('products',  info)
export const insertOrder = ( info) => insertEntry('orders',  info)
export const insertOrderItem = ( info) => insertEntry('orderItems',  info)


export async function insertEntries(tableName,infoList) {

	
	
	try {
		await sequelize.query('begin transaction;')
		for (let n = 0; n < infoList.length; n++) {
			let info = infoList[n]
			await insertEntry(tableName,info)
			
			
		}
		await sequelize.query('commit;')

		return 
	} catch (e) {
		await sequelize.query('rollback;')
		return Promise.reject(e)
	}
}

export const insertProducts = (infoList)=> insertEntries('products',infoList)

export async function createOrder({orderInfo,orderItemsInfo}) {
	const t = await sequelize.transaction();
	
	try {
		await sequelize.query('begin transaction;',{
			raw:true
		})
		await insertEntry('orders',orderInfo)
		
		orderInfo.orderItemIds = []
		for (let n = 0; n < orderItemsInfo.length; n++) {
			let info = orderItemsInfo[n]
			info.orderId = orderInfo.id
			await insertEntry('orderItems',info)
			
			orderInfo.orderItemIds.push(info.id)
		}
		await sequelize.query('commit;',{
			raw:true
		})

		return 
	} catch (e) {
		await sequelize.query('rollback;',{
			raw:true
		})
		return Promise.reject(e)
	}
}

export function sqlite_dump(filePath,callback) {

	let dumpDir = path.dirname(filePath)
	if (!fs.existsSync(dumpDir)) {
		fs.mkdirSync(dumpDir, { recursive: true });
	}
	exec(`sqlite3 ${dbPath} .dump | ForEach-Object {$_.replace("CREATE TABLE","CREATE TABLE IF NOT EXISTS")} > ${filePath}`,{
		shell:'pwsh'
	},callback)
}

export async function sqlite_reset() {
	try {
		await dbClose()
	} catch(e) {
		log.debug(e.message)
	}
	
	if(fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath)
	}
	
	execSync(`sqlite3 ${dbPath} ".exit"`)
	await dbReconnect()
}

export async function sqlite_resetAndLoadSchema() {
	try {
		await dbClose()
	} catch (e) {
		log.debug(e.message)
	}

	if (fs.existsSync(dbPath)) {
		
		fs.unlinkSync(dbPath)
	}
	let buffer = execSync(`sqlite3 ${dbPath} ".read ${process.env.DATABASE_SCHEMAPATH}" ".exit"`)
	log.info(buffer.toString())
	await dbReconnect()
}

export async function sqlite_readDump(filePath) {

	
	let buffer = execSync(`sqlite3 ${dbPath} ".read ${filePath}" ".exit"`)
	log.info(buffer.toString())
	
}


const prepareValueToDB = (value) =>{
	if (typeof (value) === 'string' || value instanceof String) {
		return `'${value}'`
	} else if (value === null) {
		return 'null'
	} else if (value === true) {
		return 1
	} else if (value === false) {
		return 0
	} else {
		return value
	}
}
