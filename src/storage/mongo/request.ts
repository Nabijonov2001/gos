import { logger } from '../../config/logger'
import Request, { IRequest } from '../../models/Request'
import AppError from '../../utils/appError'
import { RequestRepo } from '../repo/request'

export class RequestStorage implements RequestRepo {
    private scope = 'storage.request'

    async find(query: Object): Promise<IRequest[]> {
        try {
            const requests = await Request.find(query).populate('user').sort({ createdAt: -1 })

            return requests
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IRequest> {
        try {
            const request = await Request.findOne(query).populate('user')

            if (!request) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'request_404')
            }

            return request
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IRequest): Promise<IRequest> {
        try {
            const request = await Request.create(payload)

            return request
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IRequest> {
        try {
            const request = await Request.findOneAndDelete(query)

            if (!request) {
                logger.warn(`${this.scope}.get failed type_id findOneAndDelete`)
                throw new AppError(404, 'request_404')
            }

            return request
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
