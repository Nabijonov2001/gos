import { WarehouseRepo } from '../repo/warehouse'
import Warehouse, { IWarehouse } from '../../models/Warehouse'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class WarehouseStorage implements WarehouseRepo {
    private scope = 'storage.warehouse'

    async find(query: Object, status?: string): Promise<IWarehouse[]> {
        try {
            let warehouses: IWarehouse[]

            if (status === 'last') {
                warehouses = await Warehouse.find(query).sort({ createdAt: -1 }).limit(1)
            } else {
                warehouses = await Warehouse.find(query)
            }

            return warehouses
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IWarehouse> {
        try {
            const warehouse = await Warehouse.findOne(query).populate('branch')

            if (!warehouse) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'warehouse_404')
            }

            return warehouse
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IWarehouse): Promise<IWarehouse> {
        try {
            const warehouse = await Warehouse.create(payload)

            return warehouse
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IWarehouse): Promise<IWarehouse> {
        try {
            const warehouse = await Warehouse.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!warehouse) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'warehouse_404')
            }

            return warehouse
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async deleteMany(query: Object): Promise<Object> {
        try {
            const db_res = await Warehouse.deleteMany(query)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }
}
