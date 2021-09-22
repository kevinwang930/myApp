
import { log } from './log'
import path from 'path'
import _ from 'lodash'
import Database from 'better-sqlite3'
const dbPath = process.env.DATABASE_PATH
let db
let dataVersion

export function dbConnect() {
	db = new Database(dbPath, {
		fileMustExist: true,
		verbose: log.debug
	})
	getDataVersion()
}

export function dbClose() {
	db.close()
}

export async function getSqliteVersion() {
	let stmt = db.prepare("select sqlite_version()")
	return stmt.get()
}

export  function getDataVersion() {
	dataVersion = db.pragma("data_version",{simple:true})
	return dataVersion

}

export function getForeignKeyStatus() {
	return db.pragma('foreign_keys',{simple:true})
}

export  function checkDataVersion() {
	const version = db.pragma("data_version", { simple: true })
	if (dataVersion === version) {
		return true
	} else {
		dataVersion = version
		return false}
}



export  function getOrders() {
	
		let statement =   db.prepare(`
		select orders.id,orderNo,supplierId,
		sum(price*quantity) as totalAmount,
		group_concat(orderItems.id) as orderItemIds
		from orders 
			join orderitems on orderId = orders.id
			group by orders.id

		`)
		let resultArray = statement.all()
		return resultArray.map((order)=>{return {
			...order,
			orderItemIds:order.orderItemIds.split(',').map((idString)=>parseInt(idString))
		}})
}
		


// export async function checkOrdersBySupplier(supplierId) {
// 	try {
// 		let orders = await Order.findAll({
// 			attributes: ["id"],
// 			where: {
// 				supplierId: supplierId
// 			}
// 		})
// 		if (orders.length) {
// 			return orders.map(order => order.id)
// 		} else return orders
// 	} catch (e) {
// 		log.debug('check orders by supplier failed')
// 		return e
// 	}
// }


// export async function checkOrderNo(value) {
// 	const result = await Order.findOne({
// 		where: {
// 			orderNo: value
// 		}
// 	})
// 	if (result !== null) return false
// 	else return true
// }

// export async function createOrder(orderData) {
// 	const t = await sequelize.transaction();
// 	try {
// 		let order = await Order.create({
// 			supplierId: orderData.supplierId,
// 			orderNo: orderData.orderNo
// 		}, { transaction: t })
// 		orderData.id = order.id
// 		for (let n = 0; n < orderData.orderItems.length; n++) {
// 			let orderItemData = orderData.orderItems[n]
// 			orderItemData.orderId = order.id
// 			let orderItem = await OrderItem.create(orderItemData, { transaction: t })
// 			orderItemData.id = orderItem.id
// 		}
// 		await t.commit()

// 		return orderData
// 	} catch (e) {
// 		await t.rollback()
// 		return Promise.reject(e.message)
// 	}
// }

// export const deleteOrderByPk = async (id) => {

// 	try {
// 		await sequelize.query(`
// 		delete from orders where id = ${id}
// 		`,
// 		{
// 			type: QueryTypes.DELETE 
// 		})
// 	} catch (e) {
// 		return Promise.reject(e.message)
// 	}
// }

// export const getOrderTotalAmount = async (id) => {
// 	try {
// 		let result =  await sequelize.query(`
// 		select sum(price*quantity) as totalAmount
// 		from orders 
// 			join orderitems on orderId = orders.id
// 			where orders.id = :id	
// 			group by orders.id
// 		`, {
// 			type: QueryTypes.SELECT,
// 			replacements: { id: id }
// 		})
// 		return result[0].totalAmount
// 	} catch(e) {
// 		return Promise.reject(e.message)
// 	}
	
// }

// export async function getSuppliers() {
// 	try {
// 		let suppliers = await Supplier.findAll({attributes:['id','name','address','contact','cellphone','telephone']})
// 		let suppliersText = suppliers.map(supplier => supplier.toJSON())
// 		// log.debug('get suppliers from db',suppliersText)
// 		return suppliersText
// 	}catch (error) {
// 		log.error('failed to get suppliers',error)
// 	}  
// }



// export async function createSupplier(values) {

// 	const newSupplier = await Supplier.create(values)
// 	return newSupplier.id
// }

// export async function updateSupplierByPk(id,values) {

// 	const supplier = await Supplier.findByPk(id)
// 	log.debug('supplier before change',supplier.toJSON())
// 	log.debug('content to be changed',values)
// 	if(supplier) {
// 		for (const [key, value] of Object.entries(values)) {
// 			supplier[key] = value
// 		}
// 		await supplier.save()
// 		log.debug('supplier after change', supplier.toJSON())

// 	} else throw(`can not find supplier by Id ${id}`)
// }

// export async function deleteSupplierByPk(id) {
// 	log.debug('delete supplier by id ',id)
// 	await Supplier.destroy({where:{
// 		id:id
// 	}})
// }

// export async function checkSupplierNameDuplicate(name) {
// 	const result = await Supplier.findOne({
// 		where:{
// 			name:name
// 		}
// 	})
// 	if (result !== null) return true
// 	else return false
// }

// export async function getProducts() {
// 	try {
// 		let products = await Product.findAll({ attributes: ['id', 'name', 'productNo', 'description','supplierId'] })
// 		let productsText = products.map(product => product.toJSON())
// 		return productsText
// 	} catch (error) {
// 		log.error('failed to get products', error)
// 	}
// }

// export async function getProductAmountPerOrderById(productId) {
// 	return await sequelize.query(`
// 	SELECT orders.orderNo,sum(orderItems.quantity*orderItems.price) AS productAmountPerOrder
// 	FROM orderItems JOIN orders ON orderItems.orderId = orders.id
// 	WHERE orderItems.productId = ${productId}
// 	GROUP BY orders.id;
// 	`,{
// 		type:QueryTypes.SELECT
// 	})
// }

// export async function getProductDetailPerOrderById(productId) {
// 	return await sequelize.query(`
// 	SELECT orders.orderNo,sum(orderItems.quantity) as quantity,sum(orderItems.quantity*orderItems.price) AS productAmountPerOrder
// 	FROM orderItems JOIN orders ON orderItems.orderId = orders.id
// 	WHERE orderItems.productId = ${productId}
// 	GROUP BY orders.id;
// 	`, {
// 		type: QueryTypes.SELECT
// 	})
// }



// export async function createProduct(values) {

// 	const newProduct = await Product.create(values)
// 	return newProduct.id
// }

// export async function createProducts(products) {

// 	const t = await sequelize.transaction();
// 	let productsArray = []
// 	try {
// 		for (let n =0;n< products.length;n++) {
// 			let productInfo = products[n]
// 			let product = await Product.create(productInfo, { transaction: t })
// 			productInfo.id = product.id
// 			productsArray.push(productInfo)
// 		}	
// 		await t.commit()

// 		return productsArray
// 	} catch(e) {
// 		await t.rollback()
// 		return Promise.reject(e.message)
// 	}
	
// }

// export async function updateProductByPk(id, values) {

// 	const product = await Product.findByPk(id)
// 	// log.debug('product before change', product.toJSON())
// 	// log.debug('content to be changed', values)
// 	if (product) {
// 		for (const [key, value] of Object.entries(values)) {
// 			product[key] = value
// 		}
// 		try {
// 			await product.save()
// 			// log.debug('product after change', product.toJSON())
// 		} catch(e) {
// 			return Promise.reject(e.original.message)
// 		}
// 	} else throw (`can not find product by Id ${id}`)
// }

// export async function deleteProductByPk(id) {
// 	try {
// 		await sequelize.query(`
// 		delete from products where id = ${id}
// 		`,
// 		{
// 			type: QueryTypes.DELETE
// 		})
// 	} catch (e) {
// 		throw Error(e.original? e.original.message:e.message)
// 	}
// }

// export async function checkProductNo(supplierId,productNo) {
// 	let result = await Product.findOne({
// 		where:{
// 			supplierId:supplierId,
// 			productNo:productNo
// 		}
// 	})
// 	if (result === null) {
// 		return true
// 	} else {
// 		return false
// 	}
// }


// export async function checkProductsBySupplier(supplierId) {
// 	try {
// 		let products = await Product.findAll({
// 			attributes: ['id'],
// 			where: {
// 				supplierId: supplierId
// 			}
// 		})
// 		if (products.length) {
// 			return products.map(product=>product.id)
// 		} else return products
// 	} catch (e) {
// 		log.debug('check products by supplier failed')
// 		return e
// 	}
// }

// export async function checkSupplier(id) {
// 	// let sameDataVersion = await checkDataVersion()
// 	let productIds = await checkProductsBySupplier(id)
// 	let orderIds = await checkOrdersBySupplier(id)
// 	return {productIds:productIds,orderIds:orderIds}
// }



// export const getOrderItems = async () => {
// 	try {
// 		let orderItems = await sequelize.query(`select id,orderId,productId,productNo,productName,description,price,quantity
// 		from orderItems
// 		`,{type:QueryTypes.SELECT})
// 		return orderItems
// 	} catch(e) {
// 		return Promise.reject(e.message)
// 	}
// } 

// export const deleteOrderItem = async (id) => {
// 	try {
// 		return await sequelize.query(`delete from orderItems where id = ${id}`,
// 			{type:QueryTypes.DELETE}
// 		)
// 	} catch(e) {
// 		return Promise.reject(e.message)
// 	}
// }

// export const createOrderItem = async (value) => {
// 	const newOrderItem = await OrderItem.create(value)
// 	return newOrderItem.id
// }

// export const updateOrderItemByPK = async (id,updates) => {
// 	const orderItem = await OrderItem.findByPk(id)
// 	// log.debug('product before change', product.toJSON())
// 	// log.debug('content to be changed', values)
// 	if (orderItem) {
// 		for (const [key, value] of Object.entries(updates)) {
// 			orderItem[key] = value
// 		}
// 		try {
// 			await orderItem.save()
// 			// log.debug('product after change', product.toJSON())
// 		} catch (e) {
// 			return Promise.reject(e.message)
// 		}
// 	} else throw (`can not find orderItem by Id ${id}`)
// }

// export const getSupplierOrderItemsSummary = async (supplierId) => {
// 	try {
// 		let supplierProducts =  await sequelize.query(`
// 			select productNo,productName,(productNo || '-' || productName) as productLabel, sum(price*quantity) as amount from orderItems 
// 			where orderId in
// 				(select id from orders where supplierId = ${supplierId})
// 			group by productId
// 		`,
// 			{ type: QueryTypes.SELECT }
// 		)
// 		return supplierProducts.sort((a,b)=>(a.amount - b.amount))
// 	} catch (e) {
// 		return Promise.reject(e.message)
// 	}
// }
