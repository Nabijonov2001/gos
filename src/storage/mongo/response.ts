import { ResponseRepo } from '../repo/response'
import Response, { IResponse } from '../../models/Response'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ResponseStorage implements ResponseRepo {
    private scope = 'storage.response'

    async find(query: Object): Promise<IResponse[]> {
        try {
            const responses = await Response.find(query)
                .populate([
                    {
                        path: 'products',
                        select: 'cipher_code quantity name units measure_unit',
                        populate: [
                            {
                                path: 'branch',
                                select: 'name'
                            },
                            {
                                path: 'warehouse',
                                select: 'name'
                            }
                        ]
                    },
                    {
                        path: 'user',
                        populate: [{ path: 'branches', select: { name: 1 } }]
                    }
                ])
                .sort({ createdAt: 1 })

            return responses
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IResponse> {
        try {
            const response = await Response.findOne(query)

            if (!response) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'response_404')
            }

            return response
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IResponse): Promise<IResponse> {
        try {
            const response = await Response.create(payload)

            return response
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async insertMany(payload: IResponse[]): Promise<Object> {
        try {
            const responses = await Response.insertMany(payload)
            return responses
        } catch (error) {
            logger.error(`${this.scope}.insterMany: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IResponse): Promise<IResponse> {
        try {
            const response = await Response.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!response) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'response_404')
            }

            return response
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IResponse> {
        try {
            const response = await Response.findOneAndDelete(query)

            if (!response) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'response_404')
            }

            return response
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
