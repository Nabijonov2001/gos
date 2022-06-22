import { UnitRepo } from '../repo/unit'
import Unit, { IUnit } from '../../models/Unit'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class UnitStorage implements UnitRepo {
    private scope = 'storage.unit'

    async find(query: Object, status?: string): Promise<IUnit[]> {
        try {
            let units: IUnit[]

            if (status === 'last') {
                units = await Unit.find(query).sort({ createdAt: -1 }).limit(1)
            } else if (status === 'only_name') {
                units = await Unit.find(query).select('name')
            } else {
                units = await Unit.find(query)
            }

            return units
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IUnit> {
        try {
            const unit = await Unit.findOne(query)

            if (!unit) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'unit_404')
            }

            return unit
        } catch (error) {
            logger.error(`${this.scope}.fineOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IUnit): Promise<IUnit> {
        try {
            const unit = await Unit.create(payload)

            return unit
        } catch (error) {
            logger.warn(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IUnit): Promise<IUnit> {
        try {
            const unit = await Unit.findOneAndUpdate(query, payload, { new: true })

            if (!unit) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'unit_404')
            }

            return unit
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: IUnit): Promise<Object> {
        try {
            const db_res = await Unit.updateMany(query, payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async deleteMany(query: Object): Promise<Object> {
        try {
            const db_res = await Unit.deleteMany(query)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
