import { TypeRepo } from '../repo/type'
import Type, { IType } from '../../models/Type'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class TypeStorage implements TypeRepo {
    private scope = 'storage.type'

    async find(query: Object): Promise<IType[]> {
        try {
            const types = await Type.find(query).sort({ cipher_code: 1 })

            return types
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IType> {
        try {
            const type = await Type.findOne(query)

            if (!type) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'type_404')
            }

            return type
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IType): Promise<IType> {
        try {
            const type = await Type.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!type) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'type_404')
            }

            return type
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async createMany(payload: IType[]): Promise<Object> {
        try {
            const db_res = await Type.insertMany(payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.createMany: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IType): Promise<IType> {
        try {
            const type = await Type.create(payload)

            return type
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }
}
