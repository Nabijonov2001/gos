import { ProductRepo } from '../repo/product'
import Product, { IProduct } from '../../models/Product'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ProductStorage implements ProductRepo {
    private scope = 'storage.product'

    async find(query: Object, page?: number): Promise<IProduct[]> {
        try {
            let products: IProduct[]

            if (page) {
                products = await Product.find(query)
                    .populate('warehouse', 'name')
                    .populate('branch', 'name')
                    .skip(page > 0 ? (page - 1) * 30 : 0)
                    .limit(30)
                    .select('-units -sections')
            } else {
                products = await Product.find(query)
                    .populate('warehouse', 'name')
                    .populate('branch', 'name')
                    .select('-units -sections')
            }

            return products
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IProduct> {
        try {
            const product = await Product.findOne(query)
                .populate({
                    path: 'category',
                    select: 'name'
                })
                .populate({
                    path: 'sections',
                    select: 'name'
                })
                .populate({
                    path: 'units',
                    select: 'name sup_unit'
                })
                .populate({
                    path: 'branch',
                    select: 'name'
                })
                .populate({
                    path: 'warehouse',
                    select: 'name'
                })

            if (!product) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'product_404')
            }

            return product
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IProduct): Promise<IProduct> {
        try {
            const product = await Product.create(payload)

            return product
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async createMany(payloads: IProduct[]): Promise<Object> {
        try {
            const db_res = await Product.create(payloads)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.updateMany: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IProduct): Promise<IProduct> {
        try {
            const product = await Product.findOneAndUpdate(query, payload, {
                new: true
            })
                .populate({
                    path: 'branch',
                    select: 'name'
                })
                .populate({
                    path: 'warehouse',
                    select: 'name'
                })

            if (!product) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'product_404')
            }

            return product
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: IProduct | Object): Promise<Object> {
        try {
            const db_res = await Product.updateMany(query, payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.updateMany: finished with error: ${error}`)
            throw error
        }
    }

    async deleteMany(query: Object): Promise<Object> {
        try {
            const db_res = await Product.deleteMany(query)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.delete: finished  with error: ${error}`)
            throw error
        }
    }
}
